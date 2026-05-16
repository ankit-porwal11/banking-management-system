import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },

  // temp register data
  fullName: String,
  email: String,
  username: String,
  password: String,
  avatar: String,
  coverimage: String
}, { timestamps: true });

export const OTP = mongoose.model("OTP", otpSchema);