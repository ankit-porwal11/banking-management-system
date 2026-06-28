import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Transaction } from "../models/transaction.model.js";
import { Account } from "../models/account.model.js"
import { ledgerModel } from "../models/ledger.model.js";

 const getTransactions = asynHandler(async (req, res) => {

    // 1. find account of logged-in user
    const account = await Account.findOne({
        user: req.user._id
    });

    if (!account) {
        throw new ApiError(404, "Account not found");
    }


 // 2. find transactions (USER PASSBOOK STYLE)
 const transactions = await Transaction.find({
    $or: [
        { account: account._id },
        { fromAccount: account._id },
        { toAccount: account._id }
         
    ]
 })
 .populate("account", "accountNumber")
 .populate("fromAccount", "accountNumber")
 .populate("toAccount", "accountNumber")
 
 .sort({ createdAt: -1 });


// 3. format transactions (BANK PASSBOOK LOGIC)
const formattedTransactions = transactions.map(txn => {

    let direction = "UNKNOWN";

    // ✅ DEPOSIT = always CREDIT
    if (txn.type === "DEPOSIT") {
        direction = "CREDIT";
    }

    // ✅ WITHDRAW = always DEBIT
    else if (txn.type === "WITHDRAW") {
        direction = "DEBIT";
    }

    // ✅ TRANSFER = check sender/receiver
    else if (txn.type === "TRANSFER") {

        const fromId = txn.fromAccount?._id?.toString();
        const myId = account._id.toString();

        if (fromId && fromId === myId) {
            direction = "DEBIT";   // money sent
        } else {
            direction = "CREDIT";  // money received
        }
    }


  const response = {
        type: txn.type,
        direction,
        amount: txn.amount,
        description: txn.description || txn.type,
        status: txn.status,
        balanceAfter: txn.balanceAfter,
        createdAt: txn.createdAt
    };

    // Sirf transfer me from/to add karo
    if (txn.type === "TRANSFER") {
        response.from = {
            accountNumber: txn.fromAccount.accountNumber
        };

        response.to = {
            accountNumber: txn.toAccount.accountNumber
        };
    }

    return response;

});


// 4. response
return res.status(200).json(
    new ApiResponse(
        200,
        formattedTransactions,
        "Transactions fetched successfully"
    )
);
});

   const getLedgerHistory = asynHandler(async (req, res) => {

  const account = await Account.findOne({
    user: req.user._id
  });

  const ledgerEntries = await ledgerModel
    .find({ account: account._id })
    .populate("account", "accountNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      ledgerEntries,
      "Ledger history fetched successfully"
    )
  );
});


export {
     getTransactions,
     getLedgerHistory
};



// transaction flow
/*

🔥 💰 DEPOSIT FLOW (Transaction System)
USER (Postman / Frontend)
        ↓
POST /deposit API
        ↓
verifyJWT middleware
        ↓
req.user._id milta hai
        ↓
Account.findOne({ user: req.user._id })
        ↓
Account found ✔
        ↓
account.balance += amount
        ↓
account.save()
        ↓
Transaction.create({
    account: account._id,
    type: "DEPOSIT",
    amount,
    description,
    balanceAfter
})
        ↓
Response sent:
"Money deposited successfully"
🔥 💸 WITHDRAW FLOW
USER (Postman / Frontend)
        ↓
POST /withdraw API
        ↓
verifyJWT middleware
        ↓
req.user._id
        ↓
Account.findOne({ user: req.user._id })
        ↓
Account found ✔
        ↓
Check balance >= amount ?
        ↓
YES
        ↓
account.balance -= amount
        ↓
account.save()
        ↓
Transaction.create({
    account: account._id,
    type: "WITHDRAW",
    amount,
    description,
    balanceAfter
})
        ↓
Response sent:
"Money withdrawn successfully"
🔥 📜 TRANSACTION HISTORY FLOW
USER (Postman / Frontend)
        ↓
GET /transactions API
        ↓
verifyJWT middleware
        ↓
req.user._id
        ↓
Account.findOne({ user: req.user._id })
        ↓
Account found ✔
        ↓
Transaction.find({ account: account._id })
        ↓
.sort({ createdAt: -1 })
        ↓
Return all transactions:
[
  DEPOSIT,
  WITHDRAW,
  DEPOSIT
]

*/ 