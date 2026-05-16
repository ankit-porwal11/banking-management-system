// ❤️❤️ Api Error ko handle krne ke liye ek utility packeage banaye hai  ❤️ ❤️
class ApiError extends Error   {
    constructor ( // ❤️ hmne khud ka constroctor banaya hai Api Error ko handle krne ke liye 
        statusCode, // jo bhi mere is constructor ko use kre ga vo merko dega statuscode , message , error pass kr dena me btaduga 
        message = " Someting went wrong ",
        erro = [],
        stack = " " 
    ){
        // override kyo kiya hai ❤️❤️ 
        // Default Error me sirf ye hota hai  message , stack 
        // tumko aur cheeze ad krna hai 
        // jese status code , success , error , array , custom structure isliye tumne apna constructor banaya hai 
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false 
        this.errors =  this.errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this ,  this.constructor)
        }
    }
}

export {ApiError}