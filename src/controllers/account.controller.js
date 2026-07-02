import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Account } from "../models/account.model.js"
// import  { sendAccountCreatedEmail }  from "../service/email.service.js";
import { Transaction } from "../models/transaction.model.js";
import { ledgerModel } from "../models/ledger.model.js";
import { processPendingReturnRequests } from "../utils/returnSettlement.js";



const generateAccountNumber = () => {
  return (
    "2026" +
    Math.floor(100000 + Math.random() * 900000)
  );
};

const AccountCreate = asynHandler(async (req, res) => {
    
//  ❤️  ❤️
// 1. Verify user (verifyJWT already kar chuka hai)
// 2. req.user se userId lo
// 3. Check karo user ka account pehle se hai ya nahi
// 4. Account number generate karo
// 5. Account create karo
// 6. Response bhejo

  // 1. User verify ho chuka hai verifyJWT se
  const userId = req.user._id;

  // 2. Check account already exists
  const existingAccount = await Account.findOne({
    user: userId,
  });

  if (existingAccount) {
    throw new ApiError(
      400,
      "Account already exists"
    );
  }

  // 3. Generate account number
  const accountNumber = generateAccountNumber();

  // 4. Create account
  const account = await Account.create({
    user: userId,
    accountNumber,
  });

  // 5. Check account created
  const createdAccount = await Account.findById(
    account._id
  );

  if (!createdAccount) {
    throw new ApiError(
      500,
      "Something went wrong while creating account"
    );
  }
    
//    console.log("Account Create successfully");
//    console.log("EMAIL:", req.user.email);
// console.log("FULLNAME:", req.user.fullName);
  //  await sendAccountCreatedEmail( req.user.email,
  //  req.user.fullName,
  //  account.accountNumber)
//    console.log("Email sent successfully");
  // 6. Response
  return res.status(201).json(
    new ApiResponse(
      201,
      createdAccount,
      "Account created successfully"
    )
  );

});

// deposite ❤️ ❤️

const depositMoney = asynHandler(async (req, res) => {

    // 1. amount get karo
    const { amount , description } = req.body;

    // 2. validation
    if (!amount || amount <= 0) {
        throw new ApiError(
            400,
            "Please provide a valid amount"
        );
    }

    // 3. account find karo
    const account = await Account.findOne({
        user: req.user._id
    });

    if (!account) {
        throw new ApiError(
            404,
            "Account not found"
        );
    }

    // 4. balance update karo
    // account.balance += Number(amount);

    // await account.save();
// const currentBalance = await account.getBalance();
//     // 5. transaction create
//     const transaction =  await Transaction.create({
//     account: account._id,
//     type: "DEPOSIT",
//     amount: Number(amount),
//     description: "Money deposited",
//     balanceAfter: account.balance
// });

const currentBalance = await account.getBalance();

const transaction = await Transaction.create({
  account: account._id,
  type: "DEPOSIT",
  amount: Number(amount),
  description: description || "Money Withdraw",
  balanceAfter: currentBalance + Number(amount),
  status: "SUCCESS"
});
 
    console.log("TRANSACTION CREATED", transaction._id);

const ledger = await ledgerModel.create({
  account: account._id,
  amount: Number(amount),
  transaction: transaction._id,
  type: "CREADIT" // ya CREDIT, schema ke hisab se
});

console.log("LEDGER CREATED", ledger);

await processPendingReturnRequests(
  account._id
);

    // 6. response bhejo
    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Money deposited successfully"
        )
    );

    

});

// ❤️ ❤️ withdrowMoney controller

const withdrowMoney = asynHandler(async(req , res) => {

    // Get Amount from req.body
    const { amount , description} = req.body;

    // 2. validation
    if (!amount || amount <= 0) {
        throw new ApiError(
            400,
            "Please provide a valid amount"
        );
    }
   
     // 3. account find karo
    const account = await Account.findOne({
        user: req.user._id
    });

    if (!account) {
        throw new ApiError(
            404,
            "Account not found"
        );
    }
    // 4. check balance and compaire to given amount
  //   if (account.balance < Number(amount)) {
  //   throw new ApiError(
  //       400,
  //       "Insufficient balance"
  //     );
  //  }

      const currentBalance = await account.getBalance();

       if (currentBalance < Number(amount)) {
      throw new ApiError(
      400,
      "Insufficient balance"
      );
    }


      

   // 6. balance update karo
    // account.balance -= Number(amount);

    //  await account.save();

     // 7. transaction create
    const transaction = await Transaction.create({
  account: account._id,
  type: "WITHDRAW",
  amount: Number(amount),
   description: description || "Money Withdraw",
  balanceAfter: currentBalance - Number(amount),
  status: "SUCCESS"
});

console.log("TRANSACTION CREATED", transaction._id);

    await ledgerModel.create({
  account: account._id,
  amount: Number(amount),
  transaction: transaction._id,
  type: "DEBIT"
});

console.log("LEDGER CREATED", ledgerModel);


    // 8. response bhejo
    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Money WithDraw successfully"
        )
    );

})

// getAccount Details 
const getAccountDetails = asynHandler(async (req, res) => {
    const { accountNumber } = req.body;

    if (!accountNumber) {
        throw new ApiError(400, "accountNumber is required");
    }

    const account = await Account.findOne({ accountNumber })
        .populate("user", "username email fullName");

    if (!account) {
        throw new ApiError(404, "Account not found");
    }

    const balance = await account.getBalance();

    return res.status(200).json(
        new ApiResponse(200, {
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            currency: account.currency,
            balance,
            user: account.user
        }, "Account details fetched successfully")
    );
})


export {
     AccountCreate, 
     depositMoney,
     withdrowMoney,
     getAccountDetails,
 };