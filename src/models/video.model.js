import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type : String,
            required: true 
        },
        thumbnail: {
            type : String,
            required: true 
        },
        title: {
            type : String,
            required: true 
        },
        discription: {
            type : String,
            required: true 
        },
        duration: {
            type : Number,
            required: true 
        },
        views: {
            type : Number,
            default: 0 
        },
        isPublished: {
            type : Boolean,
            default: true 
        },
         owner: {
            type : Schema.Types.ObjectId,
           ref: "User"
        },
    },
    
    {
        timestamps: true    
    }
)

videoSchema.plugin(mongooseAggregatePaginate)//❤️❤️
//❤️❤️ aggregate mongodb ke ander build in hota hai ye is ke ander method hoti hai jese filter sort ... etc 
//❤️❤️ plugin kya krta hai kki kuch method ko automaticaly run krta hai tumhe kuch code likhne ki required nhi hota hai jese count skip ...


export const Video = mongoose.model("Video" , videoSchema)