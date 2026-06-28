import mongoose from "mongoose";
import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ledgerModel } from "../models/ledger.model.js";
import { User } from "../models/user.model.js";

console.log("TRANSFER API HIT");

const transferMoney = asynHandler(async (req , res) => {
console.log(req.body);
/*
create a new transaction for transfer
 . validate request
 . validate idempotency key 
 . check account status
 . drive sender balance  for ledger
 .create transaction(pending)
 .create debit ledger
 .create creadit ledger
 .mark transaction complete
 .commit mongodb seesion
 .send email notification

*/

    
// const {fromAccount ,  toAccount , amount , idempotencKey} = req.body;
// Security   Production me user ko fromAccount bhejne hi mat do.
// const {toAccount , amount , idempotencKey} = req.body;
// replace Account Number 
const { receiverAccountNumber , amount , idempotencKey} = req.body;
console.log("STEP 1");


if(!receiverAccountNumber || !amount || !idempotencKey){
   throw new ApiError(
      400,
      "  receiverAccountNumber , amount , idempotencKey are required"
    );
}


console.log("STEP 2");

const fromUserAccount = await Account.findOne({
    user: req.user._id,
})

const toUserAccount = await Account.findOne({
    // _id: toAccount
    accountNumber: receiverAccountNumber
})
console.log("FROM =", fromUserAccount);
console.log("TO =", toUserAccount);


if(!fromUserAccount || !toUserAccount){
    throw new ApiError(
        400,
        "invalid fromAccount or toAccount"
)}
   
    // Self Transfer Block
    if (fromUserAccount._id.toString() === toUserAccount._id.toString()) {
  throw new ApiError(
    400,
    "Cannot transfer to same account"
  );
}

 
const isTransactionAlreadyExist = await Transaction.findOne({
    idempotencKey: idempotencKey
})

if  (isTransactionAlreadyExist){
    if(isTransactionAlreadyExist.status === "SUCCESS"){
         return res.status(200).json(
    new ApiResponse(
      200,
       isTransactionAlreadyExist,
      "transaction already process"
    )
  )}

  if(isTransactionAlreadyExist.status === "PENDING"){
     return res.status(200).json(
    new ApiResponse(
      200,
       isTransactionAlreadyExist,
      "transaction is still processing"
    )
  )
}

 if(isTransactionAlreadyExist.status === "FAILED"){
     return res.status(500).json(
    new ApiResponse(
      500,
      "transaction process is FAILED  , please try again later"
    )
  )
}
 

 if(isTransactionAlreadyExist.status === "REVERSED"){
     return res.status(500).json(
    new ApiResponse(
      500,
      "transaction was reversed , please try again later"
    )
  )
}

    
}
 
// 3. CHECK ACCOUNT STATUS 
if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    throw new ApiError(
    400,
    "both fromaccount and toaccount must be active to procees transaction"
);
}
console.log("STEP 3");
//4. drive sender balance  for ledger
 const balance = await fromUserAccount.getBalance()

 console.log("BALANCE =", balance);
 if (fromUserAccount.user.toString() !== req.user._id.toString()) {
   throw new ApiError(403, "Unauthorized account access");
}

console.log("STEP 4");

 if(balance < amount){
  throw new ApiError(
    400,
    `insufficient balance. Current balance is ${balance}. Requested Anpunt is ${amount}`
  )
 }
      console.log("step-4 COMPLETED")

 // 5.create transaction(pending)
   const session = await mongoose.startSession()
    session.startTransaction()

    console.log("BEFORE TRANSACTION CREATE");

    const [transaction] = await Transaction.create([{
     fromAccount: fromUserAccount._id,
     toAccount : toUserAccount._id ,
     amount,
     idempotencKey,
     type: "TRANSFER",
     balanceAfter: balance - amount,
     status: "PENDING"
    }],{session})
    
    console.log("AFTER TRANSACTION CREATE");
    const debitLedgerEntry = await ledgerModel.create([{
      account: fromUserAccount._id,
      amount: amount,
      transaction:  transaction._id,
      type:"DEBIT"
    }], {session})
    console.log("AFTER DEBIT LEDGER");

    
    const creditLedgerEntry = await ledgerModel.create([{
      account: toUserAccount._id,
      amount: amount,
      transaction:  transaction._id,
      type:"CREADIT"
    }], {session})



//     console.log("DEBIT =", debitLedgerEntry);
// console.log("CREDIT =", creditLedgerEntry);
// console.log("AFTER CREDIT LEDGER");


     transaction.status = "SUCCESS"
     await transaction.save({session})

     // after
     await Transaction.findByIdAndUpdate(
    transaction._id,
    { status: "SUCCESS" },
    { session }
    
   
);

     await session.commitTransaction()  
      session.endSession()

      console.log("AFTER COMMIT");
      

//       const sender = await Account.findById("6a3f873fc2e5704257ac7e0d");
// console.log(await sender.getBalance());

// const receiver = await Account.findById("6a3d11df451d534e55c76fe7");
// console.log(await receiver.getBalance());
     
      // 10. send email notification


      return res.status(200).json(
    new ApiResponse(
     200,
      transaction,
      "Money transferred successfully"
 )
)




})


const createInitialFundTransaction = asynHandler(async(req  , res) => {
    const {toAccount , amount , idempotencKey} = req.body

    if(!toAccount || !amount || !idempotencKey){
       throw new ApiError(
        400,
        "toAccount , amount , idempotencKey are required"
       )
    }

    const toUserAccount = await Account.findOne({
      _id: toAccount
    })

    if(!toUserAccount){
      throw new ApiError(
        400,
        "invalid ToUserAccount"
      )
    }

   const formUserAccount = await Account.findOne({
    systemUser :true,
    user : req.user._id
   })

   if(!formUserAccount){
    throw new ApiError(
      400,
      "System User Account Not Found"
    )
   }

   
    const session = await mongoose.startSession()
    session.startTransaction()
    
    const transaction = await Transaction.create([{
     fromAccount: fromUserAccount._id,
     toAccount,
     amount,
     idempotencKey,
      type:"TRANSFER",
      balanceAfter,
     status: "PENDING"
    }],{session})  


    const debitLedgerEntry = await ledgerModel.create([{
      account: fromAccount._id,
      amount: amount,
      transaction:  transaction._id,
      type:"DEBIT"
    }], {session})


    const creditLedgerEntry = await ledgerModel.create([{
      account: toAccount._id,
      amount: amount,
      transaction:  transaction._id,
      type:"CREADIT"
    }], {session})

    
     transaction.status = "SUCCESS"
     await transaction.save({session})

     await session.commitTransaction()  
      session.endSession()

        return res.status(200).json(
              new ApiResponse(
                  200,
                  transaction,
                  "initial fund  Transactions completed successfully"
              )
          );

}) 

export {
    transferMoney,
    createInitialFundTransaction
}