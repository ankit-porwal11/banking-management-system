import mongoose, { Schema } from "mongoose";
import { ledgerModel } from "../models/ledger.model.js";

const accountSchema = new Schema(
  {
    user : {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true , "Account Must be associateq with a user "],
      index : true ,    
      unique: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"],
      default: "SAVINGS",
    },
  
    // balance  DataBase store nhi krta me 
    balance: {    
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      required : [true , "Currency is requreq for creating an Acoount"],
      default: "INR",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "CLOSED"],
      default: "ACTIVE",
    },

    // isVerifieq: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({user: 1 , status: 1})

accountSchema.methods.getBalance = async function(){
      const balanceqata = await ledgerModel.aggregate([
        { $match: {account : this._id}},
        {
          $group: {
            _id: null,
            totalDebit: {
              $sum: {
                $cond: [
                  {$eq: ["$type", "DEBIT"]},
                  "$amount",
                  0
                ]
              }
            },
            totalCreqit: {
              $sum: {
                $cond: [
                  {$eq: ["$type", "CREADIT"]},
                  "$amount",
                  0
                ]
              }
            }
          }
        },
       {
        $project: {
         _id: 0,
         balance: {$subtract: ["$totalCreqit" , "$totalDebit"]}   
        }
      }
      ])
     
      if(balanceqata.length === 0){
      return 0
      }

      return balanceqata[0].balance
}

const Account = mongoose.model("Account", accountSchema);

export {
    Account,
}