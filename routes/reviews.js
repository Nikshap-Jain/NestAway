const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");

const validateReview = (req, res, next) => {
  console.log(req.body);
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((info) => info.message).join(",");
    throw new expressError(400, errMsg);
  }
  next();
};

// post Review
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    console.log("in post of review");
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review is Created");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Review is deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
