const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const methodOverride = require("method-override");
const { listingSchema } = require("../schema.js");
const expressError = require("../utils/expressError.js");
const { isLoggedIn } = require("../middleware.js");

const validateListing = (req, res, next) => {
  console.log(req.body);
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((info) => info.message).join(",");
    throw new expressError(400, errMsg);
  }
  next();
};

// index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const AllListing = await Listing.find();
    res.render("listings/index.ejs", { AllListing });
  })
);

// add new listing

//this get should be before show route otherwise new will be considered as id and cause an error
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    console.log("Received request body:", req.body); // Add this line
    const newListing = await new Listing(req.body.listing);
    await newListing.save();
    console.log("Saved listing:", newListing); // Add this line
    req.flash("success", "New Listing is added successfully");
    res.redirect("/listings");
  })
);

//Edit route

router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exists");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Listing is updated successfully");
    res.redirect("/listings");
  })
);

//Delete route

router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success", "Listing is deleted successfully");
    res.redirect("/listings");
  })
);

// show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let info = await Listing.findById(id).populate("reviews");
    if (!info) {
      req.flash("error", "Listing you requested for does not exists");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { info });
  })
);

module.exports = router;
