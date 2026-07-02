import { ReturnRequest } from "../models/returnRequest.model.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ledgerModel } from "../models/ledger.model.js";

const processPendingReturnRequests = async (accountId) => {
  try {

    const requests = await ReturnRequest.find({
      approverAccount: accountId,
      settlementStatus: { $in: ["PENDING", "PARTIAL"] },
      remainingAmount: { $gt: 0 },
    });

    if (!requests.length) {
      return;
    }

    for (const request of requests) {

      const account = await Account.findById(accountId);

      if (!account) continue;

      const balance = await account.getBalance();

      if (balance <= 0) continue;

      const recoverableAmount = Math.min(
        balance,
        request.remainingAmount
      );

      if (recoverableAmount <= 0) continue;

      // Create RETURN transaction
      const returnTransaction = await Transaction.create({
        account: account._id,

        fromAccount: account._id,

        toAccount: request.requesterAccount,

        amount: recoverableAmount,

        type: "RETURN",

        balanceAfter: balance - recoverableAmount,

        status: "SUCCESS",

        referenceTransaction:
          request.originalTransaction,
      });

      // Debit approver account
      await ledgerModel.create({
        account: account._id,
        amount: recoverableAmount,
        transaction: returnTransaction._id,
        type: "DEBIT",
      });

      // Credit requester account
      await ledgerModel.create({
        account: request.requesterAccount,
        amount: recoverableAmount,
        transaction: returnTransaction._id,
        type: "CREADIT",
      });

      // Update request
      request.settledAmount += recoverableAmount;

      request.remainingAmount -= recoverableAmount;

      request.returnTransactions.push(
        returnTransaction._id
      );

      request.settlementStatus =
        request.remainingAmount === 0
          ? "COMPLETED"
          : "PARTIAL";

      await request.save();

      console.log(
        `AUTO RETURN PROCESSED -> ${recoverableAmount}`
      );
    }

  } catch (error) {
    console.log(
      "PROCESS PENDING RETURN ERROR:",
      error.message
    );
  }
};

export {
  processPendingReturnRequests,
};