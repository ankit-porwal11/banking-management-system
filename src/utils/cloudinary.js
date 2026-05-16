import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


    cloudinary.config({  // ❤️❤️ config ye permission deti hai ki file uplod krne ki permissiopn deti hai is se pta lgta hai ki kon sa account se login hai  
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async (localFilePath) => {
      try{
     if(!localFilePath) return null 
     // upload the file on cloudinary
     const response  = await cloudinary.uploader.upload(localFilePath , { // hmne ye coma lgake upload option diya hai ke kis type ka uploadf krna hai   
        resource_type: "auto"
     })
     // file successfully uploaded on cloudinary
     console.log("file is upload on cloudinary successfull" , response.url);
     fs.unlinkSync(localFilePath) // ye cloudinary pr image upload hote hi server se rermove kr dega image ko 
     return response; // ❤️❤️ ye user ke liye likha hai ki user ko chaiye vo le le ga 
      }catch (error) {
        fs.unlinkSync(localFilePath) //❤️❤️ ye hmne is liye likha hai kyo ki agr file upload nhi bhi hua to us ko server se delete kr do ..  
      return null;  
      }
    }

    export {uploadOnCloudinary}