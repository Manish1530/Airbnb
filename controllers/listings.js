const Listing=require("../models/listing");

module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listing/index.ejs", { allListings });
};

module.exports.renderNewForm= (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.showListing=async (req, res) => {
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
  };

  module.exports.createListing=async (req, res, next) => {
    let url=req.file.path;
    let filename=req.file.filename;

      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image={url,filename};
      await newListing.save();
      req.flash("success", "New Listing Created!");
      res.redirect("/listings");
    };

    module.exports.renderEditForForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","listing you requested for does not exist!")
      res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listing/edit.ejs", { listing ,originalImageUrl});
  };

  module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });

   if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  };

  module.exports.destroyListings=async (req, res) => {
    let { id } = req.params;
    let deletedString = await Listing.findByIdAndDelete(id);
    console.log(deletedString);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }