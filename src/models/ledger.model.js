import mongoose, { Schema } from "mongoose";
import { Account } from "../models/account.model.js";
import { Transaction } from "./transaction.model.js";
// Account

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required: [true , "Ledger must be associate with Account"],
        index: true,
        imuutable : true
    },
    amount:{
        type:Number,
      required: true,
       imuutable : true
    },
    transaction: {
        type :  mongoose.Schema.Types.ObjectId,
        required: [true , "Ledger must be associate with Account"],
        ref:"Transaction",
        index:true,
        immutable: true
    },
    type:{
        type: String,
        enum :{
            values: ["CREADIT" , "DEBIT"],
            message:"Type can be Either CREADIT , DEBIT"
        },

        required:[true, "Ledger Type is required"],
        immutable: true
    }
 },
   {
 timestamps:true
}
)

function preventLedgerModification(){
    throw new Error("Ledger Entires are immutable and can not modified and deleted");
}

ledgerSchema.pre('findOneAndUpdate' , preventLedgerModification);  
ledgerSchema.pre( 'findOneAndReplace' , preventLedgerModification);  
ledgerSchema.pre('findOneAndDelete' , preventLedgerModification);  
ledgerSchema.pre('updateOne' , preventLedgerModification);  
ledgerSchema.pre( 'deleteMany' , preventLedgerModification);  
ledgerSchema.pre('deleteOne' , preventLedgerModification);  
ledgerSchema.pre( 'remove' , preventLedgerModification);
ledgerSchema.pre( 'updateMany' , preventLedgerModification);

const ledgerModel = mongoose.model('ledger' , ledgerSchema);

export {
    ledgerModel  
}