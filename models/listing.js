// const { ref } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image: {
        type: String, // Store only the URL as a string
        set: (v) => (typeof v === "object" ? v.url : v) // If an object is provided, store only the 'url'
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
     {
         type:Schema.Types.ObjectId,
         ref:"Review",
     },
   ],
   owner:
     {
         type:Schema.Types.ObjectId,
         ref:"User",
     },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({ _id: {$in:listing.reviews}});
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;