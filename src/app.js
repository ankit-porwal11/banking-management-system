import express from "express";
import cors from "cors"; // ye frontend - backend connect krne ke liye 
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ // ye CROS origin se setting krne ki permission deta hai frontend backend ko 
    origin : process.env.CORS_ORIGIN,
    Credentials : true // ye allow krne ke liye hota hai 
}))
//   👇👇 data ko convert krne ka kam ye krege json format me store krne ke liye 
app.use(express.json({limit: "16kb"})) // string to json
app.use(express.urlencoded({extended: true, limit: "16kb"})) // html to json   , url ke data ko url to json krta hai 
app.use(express.static("temp")) // file to json
app.use(cookieParser()) // cookies to json


// Routes Import ❤️❤️
 import userRouter from "./routes/user.routes.js"
 import accountRouter from "./routes/account.routes.js"



// ❤️ ❤️ Account Router 
app.use("/api/v1/account" , accountRouter)

 //❤️❤️ Routes Declaration 
 app.use("/api/v1/users" , userRouter)

 // http://localhost:8000/api/v1/users/register   ... example ...👈 

export {app}