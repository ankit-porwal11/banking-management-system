import axios from "axios";

export const sendSMS = async (mobileNumber, otp) => {
  try {
    // console.log("📤 Sending SMS to:", mobileNumber);
    // console.log("🔐 API KEY:", process.env.FAST2SMS_API_KEY);

    const response = await axios.get(
      `https://www.fast2sms.com/dev/bulkV2`,
      {
        params: {
         authorization: process.env.FAST2SMS_API_KEY,
          route: "otp",
          variables_values: otp,
          flash: 0,
          numbers: mobileNumber
        }
      }
    );
console.log(process.env.FAST2SMS_API_KEY);
    console.log("🔥 FULL SMS RESPONSE:", response.data);

    return response.data;

  } catch (error) {
    console.log("❌ SMS ERROR FULL:", error.response?.data || error.message);
  }
};