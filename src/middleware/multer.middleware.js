// ❤️❤️❤️  ye file , pdf , video , img .. etc ko server pr save kra ne ka kam kre ga 
//❤️❤️ through Multer 

//❤️❤️diskStorage => file kol permanently (ya temporairly) server pe store karta hai 

import multer from "multer";

const storage = multer.diskStorage({ // diskstorage me upload kre ge file ko 
    destination: function (req , file , cb){ // ❤️❤️ file ke ander file ki information storee hogi or 
        //❤️❤️ cb callback ke through multer ko btaye ge ki file kha store krna hai  
        cb(null , "./temp/public") //❤️ null ko mtlb hota hai ki koi error nhi hai , or jo likha hai ki " " is me btaya hai ki kha  pr upload krna hai file ko save  
    },
    //❤️❤️ kis name se file ko save krna hai 
    filename: function ( req , file , cb){
        cb(null , file.originalname)
    }
})

// ❤️ ❤️ permission dedi ki multer ka use kr skte ho 
export const upload = multer({
    storage: storage
})