import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    user : {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true , "Account Must be associated with a user "],
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
      required : [true , "Currency is requred for creating an Acoount"],
      default: "INR",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "CLOSED"],
      default: "ACTIVE",
    },

    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({user: 1 , status: 1})

const Account = mongoose.model("Account", accountSchema);

export {
    Account,
}