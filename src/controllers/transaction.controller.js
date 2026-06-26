import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Transaction } from "../models/transaction.model.js";
import { Account } from "../models/account.model.js"

 const getTransactions = asynHandler(async (req, res) => {

    // 1. find account of logged-in user
    const account = await Account.findOne({
        user: req.user._id
    });

    if (!account) {
        throw new ApiError(404, "Account not found");
    }

    // 2. find transactions
    const transactions = await Transaction.find({
        account: account._id
    }).sort({ createdAt: -1 });

    // 3. response
    return res.status(200).json(
        new ApiResponse(
            200,
            transactions,
            "Transactions fetched successfully"
        )
    );
});

export {
     getTransactions
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