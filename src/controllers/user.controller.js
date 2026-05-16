import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import jwt from "jsonwebtoken";
import { OTP } from "../models/otp.model.js";
import { sendSMS } from "../utils/sendSMS.js";

// otp genearet code ❤️❤️

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//❤️ Access & refresh token generat krne ki ek method bnai hai taki bar bar nhi krna pde
// yha pr asynHandler ki required nhi hai kyo ki yha koi web req. handle nhi kr rhe hai ye hmari internal method hai
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //❤️ jese hi userko userId mile gi vo do token generate kr dega or❤️❤️ do token ko generate kr ne ka method hm ne user.model ke ander likha hua hai
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //❤️ ye mene abhi sirf generate kiye hai ye abhi sirf mere pass hai method se bahr nhi gye hai
    //❤️ Access token to hm user ko de detre hai pr refresh token ko hm apne DB me bhi rkhte hai

    // ab DB me kese rkhte hai refresh token ko
    // ye user hmare pass hota hai is ke ander sari method hoti hai to is ke through kra skte hai
    // user mongoDB se bn ke aaya hota hai
    user.refreshToken = refreshToken; // user ke ander add ho gya but save nhi hua hai
    await user.save({ validateBeforeSave: false }); // save krte time validetaion puchta hai DB to hm bol rhe hasi ki validation kuch mt lgao sidha save kr do
    // bn ne ke bad retrun kr diya dono token ko
    return { accessToken, refreshToken };
    // 👆 👆 ye sara kam ek method ke ander hua hai ab hm chahe vha use kr skte hai
  } catch (error) {
    console.log("🔥 REAL TOKEN ERROR:", error);
    throw new ApiError(
      500,
      " something went wrong while generate Access and  referesh token  "
    );
  }
};

//👇 register


// const registerUser = asynHandler(async (req, res) => {
//   // console.log("route hit hua ") // return res.status(200).json({ // message: "ok" // }) // logic for user register ❤️ ❤️ // 1. get user details from frontend // 2. validation - not empty //3. check if user already exist - username , email //4.check for image , check foor avtar // ❤️ ❤️ hmne upload kra liya haai images ko user routes ke ander multer ka use kr ke //5.upload them cloudinary , avatar //6.create user object - create entry in database //7.remove password and refresh token filed from response //8.check for user creation //9. return response
//   // //1. steps ❤️
//   const { fullName, email, username, password, mobileNumber, otp } =
//     req.body || {};
//   console.log("email:", email);
//   console.log("REQ BODY :", req.body);
//   console.log("REQ FILES :", req.files);
//   //  otp verify add section ❤️❤️❤️
//   if (otp) {
//     const record = await OTP.findOne({ mobileNumber });
//     console.log("OTP RECORD :", record);
//     if (!record) {
//       throw new ApiError(404, "OTP not found");
//     }
//     console.log("DB OTP :", record.otp);
//     console.log("USER OTP :", otp);
//     if (record.otp !== otp) {
//       throw new ApiError(400, "Invalid OTP");
//     }
//     console.log("EXPIRY :", record.expiresAt);
//     console.log("NOW :", Date.now());
//     console.log("EXPIRY TIME :", new Date(record.expiresAt).getTime());
//     if (record.expiresAt < Date.now()) {
//       throw new ApiError(400, "OTP expired");
//     }
//     console.log("OTP MATCHED, NOW CREATING USER...");
//     // ✅ FINAL USER CREATE (yaha hoga actual register)
//     const user = await User.create({
//       fullName: record.fullName,
//       email: record.email,
//       username: record.username,
//       password: record.password,
//       mobileNumber: record.mobileNumber,
//       avatar: record.avatar,
//       coverimage: record.coverimage,
//       isMobileVerified: true,
//     });
//     console.log("USER CREATED :", user);
//     const createdUser = await User.findById(user._id).select(
//       "-password -refreshToken"
//     );
//     await OTP.deleteOne({ mobileNumber });
//     return res
//       .status(201)
//       .json(new ApiResponse(200, createdUser, "user register successfully"));
//   }
//   // 2.steps
//   if (fullName === "") {
//     throw new ApiError(400, "fullName is required");
//   }
//   // ❤️ ❤️is ka short cut bhi hai check krne ka sb ek sath
//   if (
//     [fullName, email, username, password, mobileNumber].some(
//       (
//         filed // some ek method hoti hai
//       ) => filed?.trim() === ""
//     )
//   ) {
//     throw new ApiError(400, "fullName is required");
//   }
//   //3. steps
//   const existedUser = await User.findOne({
//     // findone check krta hai ki konsa mila hai jo hmne pucha hai un me se
//     $or: [{ username }, { email }, { mobileNumber }], // hm $or ka use kr ke multiple cheeze ek sath puch skte hai
//   });
//   if (existedUser) {
//     throw new ApiError(409, "user with email or username is already exist");
//   }
//   console.log(req.files);
//   // image ko clg kr ke check kiya ki image me upload ke bad response se hme kya kya milta hai
//   // 4. steps file upload
//   // file upload ke liye req.files ye hme multer de rha hai express nhi or hm [0] wali properties use kiya hai kyo ki ius jme hme path ,il;ta hai file ka jo databse se aata hai
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   // const coverimageLocalPath = req.files?.coverimage[0]?.path;
//   // second way cover image ko check krne ka
//   let coverimageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverimage) &&
//     req.files.coverimage.length > 0
//   ) {
//     coverimageLocalPath = req.files.coverimage[0].path;
//   }
//   // compalsory kr diya hai ki avatar image to lena hi hai
//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required ");
//   }
//   // 5. steps upload cloudinary
//   // await hmne is liye kraya hai ki jb tk avatar upload na ho jaye wait kro user ko server pr upload na ho jaye
//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverimage = await uploadOnCloudinary(coverimageLocalPath);
//   // agr avatar nhi gya gya hai to error throw kr do
//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required ");
//   }
//   //  🔴 ADD → old OTP delete
//   // await OTP.findOneAndDelete({ mobileNumber });
//   //  // 🔴 ADD → generate OTP //
//   //  const generatedOtp = generateOTP();
//   //  // agar same mobile ka purana otp ho to delete
//   await OTP.findOneAndDelete({ mobileNumber });
//   const generatedOtp = generateOTP();
//   // ❤️ ❤️ yha se otp send hota hai
//   await OTP.create({
//     mobileNumber,
//     otp: generatedOtp,
//     fullName,
//     avatar: avatar.url,
//     coverimage: coverimage?.url || "",
//     email,

//     password,
//     username: username.toLowerCase(),
//     expiresAt: Date.now() + 30 * 60 * 1000,
//   });
//   await sendSMS(mobileNumber, generatedOtp);
//   console.log("REGISTER OTP :", generatedOtp);
//   // console.log("REGISTER OTP :", generatedOtp);
//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "OTP sent successfully, please verify"));
// });
 // new wala code 👆


// const registerUser =asynHandler(async ( req , res ) => {
//     // console.log("route hit hua ")
//     // return res.status(200).json({
//     //     message: "ok"
//     // })

//     // without otp logic ❤️❤️

//     // logic for user register ❤️ ❤️
//    // 1. get user details from frontend
//    // 2. validation - not empty
//    //3. check if user already exist - username , email
//    //4.check for image , check foor avtar // ❤️ ❤️ hmne upload kra liya haai images ko user routes ke ander multer ka use kr ke
//    //5.upload them cloudinary , avatar
//    //6.create user object - create entry in database
//    //7.remove password and refresh token  filed from response
//    //8.check for user creation
//    //9. return response

//    // with otp logic
//    //register user through of P.
//    // 1) get user details from frentened
//    //  2) Validation-not empty check
//    // If uter already exist usexmame, email, mobile Numbe owertar
//    //  4) Check for image,
//    //  SJ veload them Cloudinary aver ul
//    //  OTP System Generate OTP
//    // delete OTP 11010 OTP before verify
//    // 8) create otp record (tempaa Storage)
//    // send OTP CConsole)
//    // 101 return response Corp sent Pleaf verify)
//    //  get oтр-HOTP+ mobileNum from frie
//    // 12) find OTP record in dif Bd match OTP
//    // 141 Check expiry
//    //  15 create actual user in dif
//    // 16) delete ore rec&d // Atte ver it rif
//    // 17) return succest response

//   //1. steps ❤️
//     // const {fullName , email , username , password , mobileNumber, otp} = req.body || {}
//     const body = req.body || {};

// const fullName = body.fullName;
// const email = body.email;
// const username = body.username;
// const password = body.password;
// const mobileNumber = body.mobileNumber;
// const otp = body.otp;

// console.log("🔥 EXTRACTED OTP:", otp);
// console.log("🔥 EXTRACTED MOBILE:", mobileNumber);
// //   console.log("email:" ,  email)
// console.log("REQ BODY :", req.body)
// console.log("REQ FILES :", req.files)

// // otp verify add section ❤️❤️❤️

// // 2.steps
// //   if(fullName === ""){
// //     throw new ApiError(400 , "fullName is required")
// //   }
// // ❤️ ❤️is ka short cut bhi hai check krne ka sb ek sath
// if(
//     [fullName , email , username , password, mobileNumber].some((filed) => // some ek method hoti hai
//     filed?.trim() === "")
// ) {
//     throw new ApiError(400 , "fullName is required")
// }

// //3. steps
// const existedUser = await  User.findOne({ // findone check krta hai ki konsa mila hai jo hmne pucha hai un me se
//     $or: [{ username } , { email }, { mobileNumber }] // hm $or ka use kr ke multiple cheeze ek sath puch skte hai
// })

// if(existedUser){
//     throw new ApiError(409 , "user with email or username is already exist")
// }

// // 4. steps file upload  // file upload ke liye req.files ye hme multer de rha hai express nhi or hm [0] wali properties use kiya hai kyo ki ius jme hme path ,il;ta hai file ka jo databse se aata hai
// const avatarLocalPath = req.files?.avatar?.[0]?.path;
// //  const coverimageLocalPath = req.files?.coverimage[0]?.path;
// // second way cover image ko check krne ka
// let coverimageLocalPath;
//   if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
//     coverimageLocalPath = req.files.coverimage[0].path
//   }

//    // compalsory kr diya hai ki avatar image to lena hi hai
//  if(!avatarLocalPath){
//     throw new ApiError(400 , "Avatar file is required ")
//  }

//  // 5. steps  upload cloudinary
//  // await hmne is liye kraya hai ki jb tk avatar upload na ho jaye wait kro user ko server pr upload na ho jaye
//  const avatar = await uploadOnCloudinary(avatarLocalPath)
//  const coverimage = await uploadOnCloudinary(coverimageLocalPath)
//   // agr avatar nhi gya gya hai to error throw kr do
//  if(!avatar){
//      throw new ApiError(400 , "Avatar file is required ")
//  }

// // 6.1. ❤️❤️ OTP FLOW START (NEW LOGIC AREA)

// // agar same mobile ka purana otp ho to delete
//   //  await OTP.findOneAndDelete({ mobileNumber })

//   // 6.2. GENERATE OTP

//     const generatedOtp = generateOTP() // ❤️ ❤️ yha se otp send hota hai
//       console.log("🔥 GENERATED OTP:", generatedOtp)

//       await OTP.findOneAndDelete({
//     mobileNumber: mobileNumber.toString().trim()
//   });

//     //6.3. STORE OTP (TEMP DATA)
//     await OTP.create({
//      mobileNumber: mobileNumber.toString().trim(),
//       otp: generatedOtp,
//       fullName,
//       avatar : avatar.url,
//       coverimage : coverimage?.url || "",
//       email,
//       password,
//       username: username.toLowerCase(),
//       expiresAt: Date.now() + 30 * 60 * 1000
//    })

//    //6.4.SEND OTP
//     await sendSMS(mobileNumber, generatedOtp);
//    console.log("REGISTER OTP :", generatedOtp)

//    //6.5.RESPONSE (STOP FLOW HERE)
//   //  return res.status(200).json(
//   //     new ApiResponse(200 , {} , "OTP sent successfully, please verify")
//   //  )
//   console.log("🔥 OTP SENT SUCCESSFULLY");

//    console.log("🔥 STEP BEFORE IF");
// console.log("🔥 REQ BODY:", req.body);
// console.log("🔥 OTP VALUE:", otp);

//   // 7. OTP VERIFY FLOW (SEPARATE LOGIC INSIDE SAME CONTROLLER)
//   // ❤️ agr otp mila to user ko to verify kro
//   console.log("🔥 VERIFY START");
//       if (otp) {
//         console.log("🔥 MOBILE (RAW):", mobileNumber);
//         console.log("🔥 OTP (USER):", otp);
//     // const record = await OTP.findOne({ mobileNumber });
// //     const record = await OTP.findOne({
// //   mobileNumber: mobileNumber.trim()
// // });
// const record = await OTP.findOne({
//   mobileNumber: mobileNumber?.trim()
// });
//     console.log("OTP RECORD :", record);

//     // check otp exist hai ya nhi
//     // agr nhi hai to error throw
//     if (record.otp.toString().trim() !== otp.toString().trim()) {
//   throw new ApiError(400, "Invalid OTP");
// }

//     // if (!record) {
//     //   throw new ApiError(404, "OTP not found");
//     // }

//     console.log("DB OTP :", record.otp);
//    console.log("USER OTP :", otp);

//     //❤️❤️ MATCH OTP

//   //    if (String(record.otp) !== String(otp)) {
//   // throw new ApiError(400, "Invalid OTP");
//   if (record.otp.toString().trim() !== otp.toString().trim()){
//   throw new ApiError(400, "Invalid OTP");
// }
//     // if (record.otp !== otp) {
//     //   throw new ApiError(400, "Invalid OTP");
//     // }
//     console.log("EXPIRY :", record.expiresAt)
// console.log("NOW :", Date.now())
// console.log("EXPIRY TIME :", new Date(record.expiresAt).getTime())

// // CHECK EXPIRY ❤️❤️
//     // if (record.expiresAt < Date.now()) {
//     if (new Date(record.expiresAt).getTime() < Date.now()){
//       throw new ApiError(400, "OTP expired");
//     }

//     console.log("OTP MATCHED, NOW CREATING USER...");

//     // 😊😊

//     // agr otp expire nhi hai to data base mme store kra diya temp se DB me

//      // ✅ FINAL USER CREATE (yaha hoga actual register)
//     const user = await User.create({
//       fullName: record.fullName,
//       email: record.email,
//       username: record.username,
//       password: record.password,
//       mobileNumber: record.mobileNumber,
//       avatar: record.avatar,
//       coverimage: record.coverimage,
//       isMobileVerified: true
//     });

//     console.log("USER CREATED :", user);

//     // CLEAN RESPONSE USER❤️❤️
//        const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//  )
//     // DELETE OTP (CLEANUP)❤️❤️
//      await OTP.deleteOne({ mobileNumber });

//      //SUCCESS RESPONSE

//     return res.status(201).json(
//       new ApiResponse(200, createdUser, "user register successfully")
//     );
//   }

// // //   // 2.steps
// // // //   if(fullName === ""){
// // // //     throw new ApiError(400 , "fullName is required")
// // // //   }
// // // // ❤️ ❤️is ka short cut bhi hai check krne ka sb ek sath
// // // if(
// // //     [fullName , email , username , password, mobileNumber].some((filed) => // some ek method hoti hai
// // //     filed?.trim() === "")
// // // ) {
// // //     throw new ApiError(400 , "fullName is required")
// // // }

// // // //3. steps
// // // const existedUser = await  User.findOne({ // findone check krta hai ki konsa mila hai jo hmne pucha hai un me se
// // //     $or: [{ username } , { email }, { mobileNumber }] // hm $or ka use kr ke multiple cheeze ek sath puch skte hai
// // // })

// // // if(existedUser){
// // //     throw new ApiError(409 , "user with email or username is already exist")
// // // }

// // // console.log(req.files);   image ko clg kr ke check kiya ki image me upload ke bad response se hme kya kya milta hai

// // // // 4. steps file upload  // file upload ke liye req.files ye hme multer de rha hai express nhi or hm [0] wali properties use kiya hai kyo ki ius jme hme path ,il;ta hai file ka jo databse se aata hai
// // // const avatarLocalPath = req.files?.avatar[0]?.path;
// // // //  const coverimageLocalPath = req.files?.coverimage[0]?.path;
// // // // second way cover image ko check krne ka
// // // let coverimageLocalPath;
// // //   if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
// // //     coverimageLocalPath = req.files.coverimage[0].path
// // //   }

// // //    // compalsory kr diya hai ki avatar image to lena hi hai
// // //  if(!avatarLocalPath){
// // //     throw new ApiError(400 , "Avatar file is required ")
// // //  }

// // //  // 5. steps  upload cloudinary
// // //  // await hmne is liye kraya hai ki jb tk avatar upload na ho jaye wait kro user ko server pr upload na ho jaye
// // //  const avatar = await uploadOnCloudinary(avatarLocalPath)
// // //  const coverimage = await uploadOnCloudinary(coverimageLocalPath)
// // //   // agr avatar nhi gya gya hai to error throw kr do
// // //  if(!avatar){
// // //      throw new ApiError(400 , "Avatar file is required ")
// // //  }

// //   // 🔴 ADD → old OTP delete
// //   // await OTP.findOneAndDelete({ mobileNumber });

// //   // 🔴 ADD → generate OTP
// //   // const generatedOtp = generateOTP();

// //   //  // agar same mobile ka purana otp ho to delete
// //   //  await OTP.findOneAndDelete({ mobileNumber })

// //   //  const generatedOtp = generateOTP() // ❤️ ❤️ yha se otp send hota hai

// //   //  await OTP.create({
// //   //     mobileNumber,
// //   //     otp: generatedOtp,
// //   //     fullName,
// //   //     avatar : avatar.url,
// //   //     coverimage : coverimage?.url || "",
// //   //     email,
// //   //     password,
// //   //     username: username.toLowerCase(),
// //   //     expiresAt: Date.now() + 30 * 60 * 1000
// //   //  })
// //   //  await sendSMS(mobileNumber, generatedOtp);
// //   //  console.log("REGISTER OTP :", generatedOtp)

// //     // console.log("REGISTER OTP :", generatedOtp)

// //   //  return res.status(200).json(
// //   //     new ApiResponse(200 , {} , "OTP sent successfully, please verify")
// //   //  )

// })

// 6. steps database Entry or datbase se sirf user.model.js wala hi folder bat kr rha hai
// const user = await User.create({ // create mothod hoti hai jo data base me store kr ti hai data ko
//   fullName,
//   avatar : avatar.url,
//   coverimage : coverimage?.url || "", // agr cover image nhi ho to  empty hi rhne do kyoki hmne compalsory nhi kiya hai
//   email,
//   password,
//   username: username.toLowerCase()  // hm ne  loware case me convert kr ke store kiya
// })
// check ki db me user create hua hai ya nhi
// db me jb bhi user create hoga to us ke sath id crete hoti hai jo moongoose create krte hai
//findByid se check kr skte hai ye ek method hota hai
// ❤️❤️ab hm kya kr skte hai ki agr user mila db me to me kya kr rha hu ki reponse me user ko password and rerfresh token send nhi krna chata hu
// to 👉 select 👈 name ki ek method hoti hai jo btati hai ki  un cheezo ko select kro jo tumhe response me nhi send krna hai jese passwrod etc.
// jo bhi data base se information aaye gi usme password or refreshToken nhi aaye ga
//  const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//  )
// agr agr database se data nhi aaya to error throw kra di hmne
//  if(!createdUser){
//     throw new ApiError(500 , "something went wrong while registring the user ")
//  }

//    return res.status(201).json(
//     new ApiResponse(200 , createdUser , "user register successfully")
//    )

// })
//👇 login


// 

// new 2 lg section 


 const registerUser = asynHandler(async (req, res) => {


    // logic for user register ❤️ ❤️
   // 1. get user details from frontend
   // 2. validation - not empty
   //3. check if user already exist - username , email
   //4.check for image , check foor avtar // ❤️ ❤️ hmne upload kra liya haai images ko user routes ke ander multer ka use kr ke
   //5.upload them cloudinary , avatar
   //6.create user object - create entry in database
   //7.remove password and refresh token  filed from response
   //8.check for user creation
   //9. return response

   // with otp logic
   //register user through of P.
   // 1) get user details from frentened
   //  2) Validation-not empty check
   // If uter already exist usexmame, email, mobile Numbe owertar
   //  4) Check for image,
   //  SJ veload them Cloudinary aver ul
   //  OTP System Generate OTP
   // delete OTP 11010 OTP before verify
   // 8) create otp record (tempaa Storage)
   // send OTP CConsole)
   // 101 return response Corp sent Pleaf verify)
   //  get oтр-HOTP+ mobileNum from frie
   // 12) find OTP record in dif Bd match OTP
   // 141 Check expiry
   //  15 create actual user in dif
   // 16) delete ore rec&d // Atte ver it rif
   // 17) return succest response
    
  // 1 setps ❤️
  const body = req.body || {};

const fullName = body.fullName;
const email = body.email;
const username = body.username;
const password = body.password;
const mobileNumber = body.mobileNumber;


const normalizedMobile = mobileNumber.toString().trim();

console.log("🔥 EXTRACTED MOBILE:", mobileNumber);
// console.log("REQ BODY :", req.body);
// console.log("REQ FILES :", req.files);
  //   console.log("🔥 EXTRACTED MOBILE:", mobileNumber);

  
  // 2. validation
  // some ek method hoti hai jo true and false return krti hai vo bol rha hai ki agr 
  // trime kr ne ke bad bhi empty "" aajaye to tru return kr dena 
  // or agr filed nhi hai to bhi true return kr dena filed hmne name diya hai is name se hm ek ek kr ke check kre ge   
  if (
    [fullName, email, username, password, mobileNumber].some(
      (field) => !field || field.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  console.log("✅ VALIDATION PASSED");

  // 3. check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { mobileNumber }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  console.log("✅ USER NOT EXISTS");

  // 4. FILE UPLOAD (UNCHANGED - YOUR CODE)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverimageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimageLocalPath = req.files.coverimage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }
console.log("✅ CLOUDINARY DONE");
  // 🔥 OTP FLOW START (FIXED ONLY HERE)

  await OTP.findOneAndDelete({
    // mobileNumber: mobileNumber.toString().trim()
      mobileNumber: normalizedMobile
  });

  const generatedOtp = generateOTP();
  console.log("🔥 GENERATED OTP:", generatedOtp);

  

  await OTP.create({
   mobileNumber: normalizedMobile,
    otp: generatedOtp,
    fullName,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
    expiresAt: Date.now() + 30 * 60 * 1000
  });

  // await sendSMS(mobileNumber, generatedOtp);
  try {
  await sendSMS(normalizedMobile, generatedOtp);
  console.log("🔥 OTP SENT SUCCESSFULLY");
} catch (error) {
  console.log("❌ SMS FAILED:", error);

  // 🔥 IMPORTANT FIX (cleanup)
  await OTP.deleteMany({
    // mobileNumber: mobileNumber.toString().trim()
     mobileNumber: normalizedMobile
  });

  throw new ApiError(500, "OTP send failed, please try again");
}

  

  console.log("🔥 OTP SENT SUCCESSFULLY");

  return res.status(200).json(
    new ApiResponse(200, {}, "OTP sent successfully, please verify")
  );
});



const verifyOtpAndRegister = asynHandler(async (req, res) => {
  const body = req.body || {};

  const mobileNumber = body.mobileNumber;
  const otp = body.otp;

  console.log("🔥 VERIFY BODY:", req.body);
  console.log("🔥 MOBILE:", mobileNumber);
  console.log("🔥 USER OTP:", otp);

  // validation
  if (!mobileNumber || !otp) {
    throw new ApiError(400, "Mobile number and OTP are required");
  }

  const normalizedMobile = mobileNumber?.toString().trim();

  // find OTP record
  const record = await OTP.findOne({
    // mobileNumber: mobileNumber.toString().trim()
    mobileNumber: normalizedMobile
  });

  console.log("🔥 OTP RECORD:", record);

  if (!record) {
    throw new ApiError(404, "OTP not found");
  }

  // OTP match
  if (record.otp.toString().trim() !== otp.toString().trim()) {
    throw new ApiError(400, "Invalid OTP");
  }

  // expiry check
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "OTP expired");
  }

  console.log("🔥 OTP VERIFIED SUCCESS");

  // final user create
  const user = await User.create({
    fullName: record.fullName,
    email: record.email,
    username: record.username,
    password: record.password,
    mobileNumber: record.mobileNumber,
    avatar: record.avatar,
    coverimage: record.coverimage,
    isMobileVerified: true
  });

  console.log("🔥 USER CREATED:", user);

  // ye check kr rha hai ki user bna hai ya nhi DB me findbyId se 
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // cleanup OTP temp record
  await OTP.deleteOne({
    // mobileNumber: mobileNumber.toString().trim()
     mobileNumber: normalizedMobile
  });

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asynHandler(async (req, res) => {
  try {
    //1. req body => data ..  request body se data lena jo frontend se aaya hai
    //2. username oe email
    //3. find the user
    //4.password check
    //5. access token and refresh token
    //6. send cookie

    //1. steps
    const { username, email, password } = req.body;
    console.log(email);
    // check kraya ki username ys email user ne send kiya hai ya nhi
    // if(!(username || email)) {
    //   throw new ApiError(400 , "username or password is required")
    // }
    if (!(username || email) || !password) {
      throw new ApiError(400, "username/email and password are required");
    }

    //3.❤️ databse me check kr rhe hai ki username ya email me se koi hai ke nhi phle se databse me kyo ki login kr rha hai to register hoga hi shi phle se
    // findOne kya krta hai ki dono me se jo us ko mil jaye ga databse me us ko check kr ke return kr dega
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    //❤️ agr database  me user ko dono hi nhi mila to error throw kra dete hai
    if (!user) {
      throw new ApiError(404, " User does not exist");
    }

    // password check krna shi hai galat
    // ye hm usermodel ki help se kr rhe hai
    // or is me hm password pass kre ge jo req.body se jo data aaye ga us me se passwrod pass kre ge
    // or vha user.model ke ander bhi mera password recive ho jaye ga or this.password se jo mera DB ke ander pas. hai vo check ho jaye ga usermodel wale method ke ander
    const isPasswordValid = await user.isPasswordCorrect(password);

    // agr password wrong hai to error dedo
    if (!isPasswordValid) {
      throw new ApiError(401, " password incorrect");
    }

    //❤️ ❤️ agr hmara pssword shi hai to Access & refresh token generate kr do
    // ❤️hmne distrucuring kr ke access , refresh token le liya hai generate kr ne ke bad
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    // abi jo refresh token hai vo empty hai kyo ki user ko update krna hoga kyo ki jha hmne findOne kiya tha vha empty hai
    // to us ko update krna ho ga
    // hm ne loogedinuser ko password and refresh token send nhi kiya
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // ab is dono token  ko cookies me send kro user(frontend wala) ko
    // cookie kya hai ki frontend se koi bhi modifies kr skrta hai pr
    // hmne kya kiya ki httpOnly , secur true kr kiya hai  to ye cookie ab bs server se hi modifies ki ja skti hai or server in ko acces bhi kr leta hai
    const options = {
      httpOnly: true,
      secure: true,
    };
    // ye jo hmne perenthises me jo diya hai without double qota ye values hoti hai
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken, // yha pr hmne fir se token isliye send kiye taki moanlo user un token ko local storage me save krana chata hai to
          },

          "User logged In Successfully " // user ko ek message bhi send kiya
        )
      );
  } catch (error) {
    // 👇 YAHAN DEBUG KARO
    // console.log("🔥 LOGIN ERROR:", error);

    // optional: sirf message bhi dekh sakte ho
    console.log("ERROR MESSAGE:", error.message);

    throw error; // important (asynHandler ko pass karne ke liye)
  }
}); // 👆 👆 login to hogya hai

// 👇 logout bhi kr te hai

const logoutUser = asynHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id, // is se user find ho jaye ga
      {
        // $set: {
        //   // set ye mongoDB ka opreatore hota hai jo mongo db ke ander update krne ka kam krta hai isko filed dena hota hai ki ya kya update krna hai
        //   refreshToken: undefined, // refresh token DB me se ht jaye ga
        // },
          
        $unset: {
          refreshToken: 1
        }

      },
      {
        new: true, // is se kya hoga ki jo respone aaye ga DB se us me update wala hi data aaye ga old wala nhi
      }
    );
    // options me se bhi to cookies ko clear krna hai logout hone ke   bad
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, " User logout successfully "));
  } catch (error) {
    console.log("🔥 REAL logout ERROR:", error);
  }
});

// refreshAccessToken End point 👇

const refreshAccessToken = asynHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token expired or use ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refresh Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refreshToken");
  }
});


// Change Current Password ❤️

const changeCurrentPassword = asynHandler(async (req , res) => {

  const {oldPassword , newPassword} = req.body

  // auth ke user me se userid nikal rhe hai 
  const user =  await User.findById(req.user?._id)

 const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)
  
  if(!isPasswordCorrect){
    throw new ApiError(400 , "Invalid password")

    user.password = newPassword
    user.save({validateBeforeSave: false})
     
    return res
    .status(200)
    .json(new ApiResponse(200, {} , " Password Change SuccessFully"))
 
  }
  
})

// get current User 
  
const getCurrentUser = asynHandler(async(req , res)=> {
  return res
  .status(200)
  .json(new ApiResponse(
    200 ,
     req.user ,
      "Current User Fetch SuccessFully"
  ))
})

// user details Updated 
const updateAccountDetails = asynHandler(async(req , res)=> {
  const {fullName , email} = req.body

  if(!fullName || !email){
    throw new ApiError(400 , "All fied are requerd")
  }
  
  const user = await  User.findByIdAndUpdate(
    req.user?._id,
    {
     $set: {
      fullName,
      email: email
     }
    },
    {
      new: true
    }
  ).select("-password")

  return res 
  .status(200)
  .json(new ApiResponse(200, user , "Account Details Updated Successfully"))

})

// user profile image update

const updateUserAvatar = asynHandler(async(req , res) => {
   
  // hm multer se image lege 
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is missing ")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400 , " Error While uploading on avatar")
  }

  const user =  User.findByIdAndUpdate(
    req.user?._id,
    {
    $set: {
      avatar : avatar.url
    }
    },{
      new: true
    }
  ).select("-password")
   
  return res
  .status(200)
  .json(
    new ApiResponse(
      200 , user , "Avatar is updated SuccessFully"
    )
  )


})

// update coverImage 

const updateUserCoverImage = asynHandler(async(req , res) => {
   
  // hm multer se image lege 
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400 , "coverimage file is missing ")
  }

  const coverimage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverimage.url){
    throw new ApiError(400 , " Error While uploading on avatar")
  }

  const user =  User.findByIdAndUpdate(
    req.user?._id,
    {
    $set: {
      coverimage : coverimage.url
    }
    },{
      new: true
    }
  ).select("-password")
   
  return res
  .status(200)
  .json(
    new ApiResponse(
      200 , user , "coverimage is updated SuccessFully"
    )
  )


})

export { registerUser, loginUser, logoutUser, refreshAccessToken ,
   verifyOtpAndRegister,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage
  };
