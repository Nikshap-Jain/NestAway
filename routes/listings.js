// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
// const { listingSchema } = require("../schema.js");
// const expressError = require("../utils/expressError.js");
// const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// const listingController = require("../controller/listings.js");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// // add new listing

// //this get should be before show route otherwise new will be considered as id and cause an error

// router.get("/new", isLoggedIn, listingController.renderNewForm);

// // index route
// router
//   .route("/")
//   .get(wrapAsync(listingController.index))
//   .post(
//     isLoggedIn,
//     validateListing,
//     wrapAsync(listingController.createNewListing)
//   );

// //Edit route

// router
//   .route("/:id")
//   .put(
//     isLoggedIn,
//     isOwner,
//     validateListing,
//     wrapAsync(listingController.updateListing)
//   )
//   .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))
//   .get(wrapAsync(listingController.showListing));

// router.get(
//   "/:id/edit",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.renderEditForm)
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const expressError = require("../utils/expressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listings.js");
const upload = require("../cloudSetup/multerConfig.js"); // Use the new multer config

// add new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// index route
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  upload.single("listing[image]"), // Add multer middleware before validation
  validateListing,
  wrapAsync(listingController.createNewListing)
);

// Edit route
router
  .route("/:id")
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), // Add multer middleware here too
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))
  .get(wrapAsync(listingController.showListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
