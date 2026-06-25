import { Router } from "express";
import {changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
// import {verifyOtpAndRegister} from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post( //❤️ hmne kya kiya ki post hone se just phle multer use kr liya hai taki me images bhej sku 
   upload.fields([ //❤️❤️ ye filed kya krta hai ki array ke form me multiple file upload kra skta hai 
       {
        name: "avatar",
        maxCount: 1
       },
       {
          name : "coverimage",
          maxCount: 1
       }
   ]), 
    registerUser
)

router.route("/login").post(loginUser)

// secure route
router.route("/logout").post( verifyJWT ,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT , changeCurrentPassword);

router.route("/current-user").get(verifyJWT , getCurrentUser);

router.route("/update-account").patch(verifyJWT , updateAccountDetails);

router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar);

router.route("/cover-image").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage);





export default router