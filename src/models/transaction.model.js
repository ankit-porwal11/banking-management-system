import mongoose, { Schema } from "mongoose";
import { Account } from "./account.model.js";

const transactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
     required: function () {
    return this.type !== "TRANSFER";
  },
    },

    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW", "TRANSFER" , "RETURN"],
      required: true,
    },

     fromAccount: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Account",
   required: function () {
      return this.type === "TRANSFER";
   },
   index: true
}, 

toAccount: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Account",
   required: function () {
      return this.type === "TRANSFER";
   },
   index: true
},

  idempotencKey: {
   type: String,
   required: function () {
      return this.type === "TRANSFER";
   },
    index:true,
      unique: true
},

    amount: {
      type: Number,
      required: [true, "Amount is required Creating a Transaction"],
    },

    currency: {
      type: String,
      default: "INR",
    },

    description: {
      type: String,
      default: "",
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: {
         values: ["SUCCESS", "FAILED" , "PENDING" , "REVERSED"],
          message: "Sataus Can be either SUCCESS , FAILED , PENDING , REVERSED " 
    },
      default: "PENDING",
    },
    referenceTransaction: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Transaction",
  default: null,
  index: true
},
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);


export {
   Transaction,
}