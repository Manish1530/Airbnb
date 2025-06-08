const express=require("express");
const router=express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const {listingSchema}=require("../schema.js");
const expressError= require("../utils/expressError.js");
const Listing=require("../models/listing.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }else{
        next();
    }
};


//listing route
//index route
router.get("/",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listing/index.ejs",{allListings});
});

//new route
router.get("/new",(req,res)=>{
    res.render("listing/new.ejs")
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","listings that you requested for does not exits!");
      return  res.redirect("/listings") 
    }
    res.render("listing/show.ejs",{listing})    
})
);

//create route
router.post("/",validateListing,wrapAsync(async(req,res,next)=>{
        const newListing=new Listing( req.body.listing);
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
})
);

//edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id);
    res.render("listing/edit.ejs",{listing});
})
);

//update route
router.put("/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
})
);

//delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
     let {id}=req.params;
    let deletedString= await Listing.findByIdAndDelete(id);
    console.log(deletedString);
req.flash("success","Listing Deleted!");
    res.redirect("/listings");
})
);


module.exports=router;