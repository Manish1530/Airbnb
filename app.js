const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

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

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("hi i am root")
});

//index route
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listing/index.ejs",{allListings});
});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listing/new.ejs")
});

//show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id);
    res.render("listing/show.ejs",{listing})
});

//create route
app.post("/listings",async(req,res)=>{
    const newListing=new Listing( req.body.listing);
    // console.log(newListing);
    await newListing.save();
    res.redirect("listings")
});

//edit route
app.get("/listings/:id/edit",async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id);
    res.render("listing/edit.ejs",{listing});
});

//update route
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async(req,res)=>{
     let {id}=req.params;
    let deletedString= await Listing.findByIdAndDelete(id);
    console.log(deletedString);
    res.redirect("/listings");
})


// app.get("/testListing",async (req,res)=>{
//     let smapleListing=new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         location:"goa",
//         country:"india"
//     });
//     await smapleListing.save()
//     console.log("sample was saved");
//     res.send("sucessful working");
// })

app.listen(8080,()=>{
    console.log("server is listening on port 8080")
})