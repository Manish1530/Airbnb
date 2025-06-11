if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const expressError= require("./utils/expressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listings.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const { error } = require('console');


// const MONGO_URL="mongodb://127.0.0.1:27017/wonderlust";
const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("DBs connected");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
          secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("hi i am root")
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
     res.locals.currUser=req.user;  
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"manish284@gmail.com;",
//         username:"manish"
//     });

// let registeredUser=await User.register(fakeUser,"helloworld");
// res.send(registeredUser); 

// })

// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map((el)=>el.message).join(",");
//         throw new expressError(400,errMsg);
//     }else{
//         next();
//     }
// };

// const validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map((el)=>el.message).join(",");
//         throw new expressError(400,errMsg);
//     }else{
//         next();
//     }
// };

app.use("/listings",listingsRouter)
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)

// //index route
// app.get("/listings",async (req,res)=>{
//     const allListings=await Listing.find({});
//     res.render("listing/index.ejs",{allListings});
// });

// //new route
// app.get("/listings/new",(req,res)=>{
//     res.render("listing/new.ejs")
// });

// //show route
// app.get("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id).populate("reviews");
//     res.render("listing/show.ejs",{listing})
// })
// );

// //create route
// app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
//         const newListing=new Listing( req.body.listing);
//         await newListing.save();
//         res.redirect("listings");
// })
// );

// //edit route
// app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
// let {id}=req.params;
// const listing=await Listing.findById(id);
//     res.render("listing/edit.ejs",{listing});
// })
// );

// //update route
// app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// })
// );

// //delete route
// app.delete("/listings/:id",wrapAsync(async(req,res)=>{
//      let {id}=req.params;
//     let deletedString= await Listing.findByIdAndDelete(id);
//     console.log(deletedString);
//     res.redirect("/listings");
// })
// );


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

app.all("*",(req,res,next)=>{
    next(new expressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
    let{statuscode=500,message="something went wrong"}=err;
    res.status(statuscode).render("error.ejs",{message})
    // res.status(statuscode).send(message);  
});

app.listen(8080,()=>{
    console.log("server is listening on port 8080")
})                  