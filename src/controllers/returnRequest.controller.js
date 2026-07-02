import mongoose from "mongoose";
import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";

import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ReturnRequest } from "../models/returnRequest.model.js";
import { ledgerModel } from "../models/ledger.model.js";


/*
=====================================================
1. CREATE RETURN REQUEST
=====================================================
flow:
. validate request
. find sender account
. find receiver account
. validate original transaction
. self request block
. create return request
. set expiry
. return response
*/
const createReturnRequest = asynHandler(async (req, res) => {
  console.log("CREATE RETURN REQUEST HIT");
  console.log("BODY =", req.body);

  const {
    receiverAccountNumber,
    amount,
    originalTransactionId,
    reason,
  } = req.body;

  // 1. Validate Request
  if (
    !receiverAccountNumber ||
    !amount ||
    !originalTransactionId
  ) {
    throw new ApiError(
      400,
      "receiverAccountNumber, amount and originalTransactionId are required"
    );
  }

  // 2. Find Sender Account
  const senderAccount = await Account.findOne({
    user: req.user._id,
  });

  if (!senderAccount) {
    throw new ApiError(
      404,
      "Sender account not found"
    );
  }

  // 3. Find Receiver Account
  const receiverAccount = await Account.findOne({
    accountNumber: receiverAccountNumber,
  });

  if (!receiverAccount) {
    throw new ApiError(
      404,
      "Receiver account not found"
    );
  }

  // 4. Self Request Block
  if (
    senderAccount._id.toString() ===
    receiverAccount._id.toString()
  ) {
    throw new ApiError(
      400,
      "Cannot create return request on same account"
    );
  }

  // 5. Validate Original Transaction
  const originalTransaction =
    await Transaction.findById(
      originalTransactionId
    );

  if (!originalTransaction) {
    throw new ApiError(
      404,
      "Original transaction not found"
    );
  }

  // Must be transfer
  if (originalTransaction.type !== "TRANSFER") {
    throw new ApiError(
      400,
      "Only transfer transactions are eligible for return requests"
    );
  }

  // Must be successful
  if (originalTransaction.status !== "SUCCESS") {
    throw new ApiError(
      400,
      "Transaction is not successful"
    );
  }

  // Logged-in user must be sender
  if (
    originalTransaction.fromAccount.toString() !==
    senderAccount._id.toString()
  ) {
    throw new ApiError(
      403,
      "You can only create return request for your own transfer"
    );
  }

  // Receiver must match original transaction receiver
  if (
    originalTransaction.toAccount.toString() !==
    receiverAccount._id.toString()
  ) {
    throw new ApiError(
      400,
      "Receiver account does not match original transaction"
    );
  }

 
// Amount check
if (amount > originalTransaction.amount) {
  throw new ApiError(
    400,
    "Return amount cannot exceed original transfer amount"
  );
}

 const existingRequest =
  await ReturnRequest.findOne({
    originalTransaction: originalTransaction._id
  });

if (existingRequest) {
  throw new ApiError(
    400,
    "Return request already exists for this transaction"
  );
}


  // Prevent duplicate return requests
// const existingRequest =
//   await ReturnRequest.findOne({
//     originalTransaction: originalTransaction._id,
//     settlementStatus: {
//       $ne: "COMPLETED"
//     }
//   });

// if (existingRequest) {
//   throw new ApiError(
//     400,
//     "Return request already exists for this transaction"
//   );
// }

  // 6. Create Return Request
  const request = await ReturnRequest.create({
    originalTransaction:
      originalTransaction._id,

    requesterAccount:
      senderAccount._id,

    approverAccount:
      receiverAccount._id,

    totalAmount: amount,

    settledAmount: 0,

    remainingAmount: amount,

    reason: reason || "",

    status: "PENDING",

    settlementStatus: "PENDING",

    expiresAt: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      request,
      "Return request created successfully"
    )
  );
});


/*
=====================================================
2. APPROVE RETURN REQUEST (CORE LOGIC)
=====================================================
flow:
. find request
. validate status
. check approver ownership
. check expiry
. calculate recoverable amount
. start transaction
. create RETURN transaction
. update ledger via transaction model
. update request settlement
. commit transaction
*/
const approveReturnRequest = asynHandler(async (req, res) => {
  console.log("APPROVE RETURN REQUEST HIT");

  const { requestId } = req.params;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find Request
    const request = await ReturnRequest.findById(requestId).session(session);

    if (!request) {
      throw new ApiError(404, "Return Request Not Found");
    }

    // 2. Status Check
    if (request.status !== "PENDING") {
      throw new ApiError(400, "Request already processed");
    }

    // 3. Approver Validation
    const approverAccount = await Account.findById(
      request.approverAccount
    ).session(session);

    if (!approverAccount) {
      throw new ApiError(404, "Approver account not found");
    }

    if (
      approverAccount.user.toString() !==
      req.user._id.toString()
    ) {
      throw new ApiError(403, "Unauthorized");
    }

    // 4. Expiry Check
    if (new Date() > request.expiresAt) {
      request.status = "EXPIRED";

      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(400).json(
        new ApiResponse(400, null, "Request expired")
      );
    }

    // 5. Balance Check
    const balance = await approverAccount.getBalance();

    const recoverableAmount = Math.min(
      balance,
      request.remainingAmount
    );

    // Mark Approved
    request.status = "APPROVED";
    request.approvedAt = new Date();

    // 6. No Funds Available
    if (recoverableAmount <= 0) {
      request.settlementStatus = "PARTIAL";

      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(
        new ApiResponse(
          200,
          request,
          "Approved - waiting for funds"
        )
      );
    }

    // 7. Create RETURN Transaction
    const [returnTransaction] = await Transaction.create(
      [
        {
          account: approverAccount._id,

          fromAccount: approverAccount._id,

          toAccount: request.requesterAccount,

          amount: recoverableAmount,

          type: "RETURN",

          balanceAfter:
            balance - recoverableAmount,

          status: "SUCCESS",

          referenceTransaction:
            request.originalTransaction,
        },
      ],
      { session }
    );

    // 8. Debit Ledger Entry
    await ledgerModel.create(
      [
        {
          account: approverAccount._id,
          amount: recoverableAmount,
          transaction: returnTransaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    // 9. Credit Ledger Entry
    await ledgerModel.create(
      [
        {
          account: request.requesterAccount,
          amount: recoverableAmount,
          transaction: returnTransaction._id,
          type: "CREADIT",
        },
      ],
      { session }
    );

    // 10. Update Settlement
    request.settledAmount += recoverableAmount;

    request.remainingAmount -= recoverableAmount;

    request.returnTransactions.push(
      returnTransaction._id
    );

    request.settlementStatus =
      request.remainingAmount === 0
        ? "COMPLETED"
        : "PARTIAL";

    await request.save({ session });

    // 11. Commit
    await session.commitTransaction();

    session.endSession();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          request,
          returnTransaction,
        },
        "Return request approved successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    throw error;
  }
});

/*
=====================================================
3. REJECT RETURN REQUEST
=====================================================
flow:
. find request
. validate status
. check ownership
. check expiry
. mark rejected
*/
const rejectReturnRequest = asynHandler(async (req, res) => {
  console.log("REJECT RETURN REQUEST HIT");

  const { requestId } = req.params;

  const request = await ReturnRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Return Request Not Found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, "Request already processed");
  }

  const approverAccount = await Account.findById(request.approverAccount);

  if (approverAccount.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (new Date() > request.expiresAt) {
    request.status = "EXPIRED";
    await request.save();

    return res.status(400).json(
      new ApiResponse(400, null, "Request expired")
    );
  }

  request.status = "REJECTED";
  request.rejectedAt = new Date();

  await request.save();

  return res.status(200).json(
    new ApiResponse(200, request, "Return request rejected")
  );
});


/*
=====================================================
4. PROCESS PENDING SETTLEMENTS (AUTO ENGINE)
=====================================================
flow:
. find pending requests
. loop each request
. check receiver balance
. calculate recoverable amount
. create return transaction
. update request
*/
const processPendingSettlements = asynHandler(async (req, res) => {
  console.log("PROCESS SETTLEMENTS HIT");

  const session = await mongoose.startSession();

  try {

    const requests = await ReturnRequest.find({
      settlementStatus: { $in: ["PENDING", "PARTIAL"] },
      remainingAmount: { $gt: 0 },
    });

    for (const request of requests) {

      session.startTransaction();

      const account = await Account.findById(
        request.approverAccount
      ).session(session);

      const balance = await account.getBalance();

      const recoverableAmount = Math.min(balance, request.remainingAmount);

      if (recoverableAmount <= 0) {
        await session.commitTransaction();
        continue;
      }

      const transaction = await Transaction.create(
        [
          {
            fromAccount: account._id,
            toAccount: request.requesterAccount,
            amount: recoverableAmount,
            type: "RETURN",
            status: "SUCCESS",
          },
        ],
        { session }
      );

      request.settledAmount += recoverableAmount;
      request.remainingAmount -= recoverableAmount;

      request.returnTransactions.push(transaction[0]._id);

      request.settlementStatus =
        request.remainingAmount === 0 ? "COMPLETED" : "PARTIAL";

      await request.save({ session });

      await session.commitTransaction();
    }

    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, null, "Pending settlements processed")
    );

  } catch (error) {
    session.endSession();
    throw new ApiError(500, error.message);
  }
});


/*
=====================================================
5. GET MY RETURN REQUESTS
=====================================================
flow:
. find user account
. fetch sent + received requests
*/
const getMyReturnRequests = asynHandler(async (req, res) => {
  console.log("GET MY RETURN REQUESTS HIT");

  const account = await Account.findOne({ user: req.user._id });

  const requests = await ReturnRequest.find({
    $or: [
      { senderAccount: account._id },
      { approverAccount: account._id },
    ],
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, "Fetched successfully")
  );
});


/*
=====================================================
6. GET PENDING APPROVALS
=====================================================
flow:
. find user account
. fetch only pending requests
*/
const getPendingApprovals = asynHandler(async (req, res) => {
  console.log("GET PENDING APPROVALS HIT");

  const account = await Account.findOne({ user: req.user._id });

  const requests = await ReturnRequest.find({
    approverAccount: account._id,
    status: "PENDING",
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, "Pending approvals fetched")
  );
});


/*
=====================================================
EXPORTS
=====================================================
*/
export {
  createReturnRequest,
  approveReturnRequest,
  rejectReturnRequest,
  processPendingSettlements,
  getMyReturnRequests,
  getPendingApprovals,
};