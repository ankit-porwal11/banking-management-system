// 👇 👇  jo mera Error Aye ga us  ko  handle krne ke liye .
//  using promise skip try and catch   ye thoda sa advance syntax hai ❤️ ❤️
const asynHandler = (requestHandler) => {
   return (req , res , next) => {
    Promise.resolve(requestHandler(req , res ,next)).catch((err) => next(err))
  }
}



export {asynHandler}

// 👇👇 using try and catch 
// const asynHandler = (fn) => async (req , res , next) => {
//   try{
//    await fn(req , res ,next)
//   }catch (error){
//    res.status(err.code || 500).json({
//     success: false,
//     message: err.message
//    })
//   }
// }