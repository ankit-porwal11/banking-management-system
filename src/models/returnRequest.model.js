import mongoose, { Schema } from "mongoose";

const returnRequestSchema = new Schema(
  {
    originalTransaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
      immutable: true
    },

    requesterAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      immutable: true
    },

    approverAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      immutable: true
    },

    // Original transfer amount
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
      immutable: true
    },

    // Amount already returned
    settledAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Amount still pending
    remainingAmount: {
      type: Number,
      required: true,
      min: 0
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "EXPIRED"
      ],
      default: "PENDING",
      index: true
    },

    settlementStatus: {
      type: String,
      enum: [
        "PENDING",     // Approval pending
        "PARTIAL",     // Some amount recovered
        "COMPLETED"    // Full amount recovered
      ],
      default: "PENDING",
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    returnTransactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction"
      }
    ],

    approvedAt: {
      type: Date,
      default: null
    },

    rejectedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

returnRequestSchema.index({
  requesterAccount: 1,
  status: 1
});

returnRequestSchema.index({
  approverAccount: 1,
  status: 1
});

returnRequestSchema.index({
  settlementStatus: 1,
  remainingAmount: 1
});

const ReturnRequest = mongoose.model(
  "ReturnRequest",
  returnRequestSchema
);

export { 
    ReturnRequest 
};