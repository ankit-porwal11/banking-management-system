import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// man lo res ka use nhi ho rha hai to vha pr 👉 _ 👈  lga skte ho 
export const verifyJWT = asynHandler(async(req , _, next) => {
   try{
    // yha pr kya hhua ki jo request aayi us req ki cookie me se access token nikal liya or token variable ke ander store kra diya 
     const token =   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new ApiError(401 , "Unauthorized request")
    }

    // agr token mil gya to us ko verify krana ho ga jo ki hoga jwt ke through 
    // fir verify kr te time kya hua ki jwt.verify ne kya kiya ki jo mere pass phle se token tha us ko or jo req se token mila dono ko match kraye ga ki expiry to nhi hai and etc..  
  const decodedToken =   jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
  // or verify hone ke bad us token ko decodedtoken ke variavle me store kr dega 
  // or fir DB se decodedtoken ke ander se id nikal ke DB me check kre ga .. decodedToken?._id is ka mtlb hota hai ki decodedtoken se id nikal lo 
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

  if(!user){
    throw new ApiError(401 , "Invalid Access token")
  }

  // hmne ek user ka new object create kiya 
  req.user = user;
  next()
   }
   catch(error){
    throw new ApiError(401 , error?.message || "invalid access token ")
   }
})