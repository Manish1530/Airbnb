const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLogedIn, isOwner, validateListing } = require("../middleware.js");

//listing route
//index route
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listing/index.ejs", { allListings });
});

//new route
router.get("/new", isLogedIn, (req, res) => {
  res.render("listing/new.ejs");
});

//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
         path: "reviews",
         populate: {
             path: "author",
             }, 
        })
      .populate("owner");
    if (!listing) {
      req.flash("error", "listings that you requested for does not exits!");
      return res.redirect("/listings");
    }
    // console.log(listing); 
    res.render("listing/show.ejs", { listing });
  })
);

//create route
router.post(
  "/",
  isLogedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

//edit route
router.get(
  "/:id/edit",
  isLogedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing });
  })
);

//update route
router.put(
  "/:id",
  isLogedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

//delete route
router.delete(
  "/:id",
  isLogedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedString = await Listing.findByIdAndDelete(id);
    console.log(deletedString);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
