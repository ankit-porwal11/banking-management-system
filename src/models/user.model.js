//❤️❤️user module 
import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true 
        } ,
           email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        } ,
          fullName : {
            type: String,
            required: true,
            index: true ,
            trim: true,
        } ,
         
         avatar : { //❤️❤️ avtar mtlb profile picture DP 
            type: String,
            required: true
        } ,
         coverimage : { // ❤️❤️ background image 
            type: String
        } ,
         watchHistory : [
            {
            type: Schema.Types.ObjectId,
            ref : "Video"
            }
    ] ,
      // 🔴 ADD HERE 👇 (watchHistory ke baad)

      mobileNumber: {
       type: String,
       required: true,
        unique: true,
         trim: true
       },
          isMobileVerified: {
          type: Boolean,
           default: false
        },

     password : {
            type: String,
            required: [true , 'Password is required']
        } ,
         refreshToken : {
            type: String
        } 
     },
    {
        timestamps : true
    }
) 

// userSchema.pre("save" , async  function (next) {
//   if(!this.isModified("password")) return next(); 
  
//     this.password = await bcrypt.hash(this.password, 10)
//      next();
 
// })

// password bcrypt ho rha hai hai 👇

userSchema.pre("save" , async function () {
   if(!this.isModified("password")) return;

   this.password = await bcrypt.hash(this.password, 10);
})

// 👇👇 password check ho rha hai 

userSchema.methods.isPasswordCorrect = async function 
(password) {
    return await  bcrypt.compare(password, this.password)
    
}
  // ❤️❤️ Access Token Generate kr Ne ka Method 👇
userSchema.methods.generateAccessToken = function () {
  return  jwt.sign( // JWT Sing. Token Generate kr ne ka kam krta hai 
    {
        // 👇 ye sare data already mongodb me store hai is liye this ka use kiya hai 
      _id: this._id,
      email: this.email,
      username : this.username,
      fullName : this.fullName
    },
    //❤️❤️ is ko ek Access token ka secret chaiye hota hai 
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function () {
    return  jwt.sign( // ❤️❤️ ye bhi same work krta hai jese hmne abhi Accesee token genetar
    // ❤️  krna sikha hai vese hi but is me information km hoti hai 
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User = mongoose.model("User" , userSchema)