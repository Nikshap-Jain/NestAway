const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const expressError = require("../utils/expressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listings.js");

// index route
router.get("/", wrapAsync(listingController.index));

// add new listing

//this get should be before show route otherwise new will be considered as id and cause an error
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createNewListing)
);

//Edit route

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);

//Delete route

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing)
);

// show route
router.get("/:id", wrapAsync(listingController.showListing));

module.exports = router;
