const mongoose=require("mongoose");
const initData =require("./data.js")
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wonderlust";

main().then(()=>{
    console.log("DBs connected");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
};

const intDB=async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({...obj,owner:'6846567e5d21f275d1b09491'}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
 intDB();