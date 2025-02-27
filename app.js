const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate"); //use to make template like navbar which show on other ejs template (layouts in views folder)
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const mongoURL = "mongodb://127.0.0.1:27017/nestaway";
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");
const listings = require("./routes/listings.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
  await mongoose.connect(mongoURL);
}

main()
  .then((res) => console.log("Database is connected"))
  .catch((err) => console.log("Error in Database connection"));

app.get("/", (req, res) => {
  res.send("Root");
});

app.use("/listings", listings);

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
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    console.log("in post of review");
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    res.redirect(`/listings/${id}`);
  })
);
//If there is a incorrect route it handled here

app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not found , route don't exits"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went wrong" } = err;
  res.status(statusCode);
  res.render("listings/error.ejs", { err });
});

app.listen(3000, () => {
  console.log("App is Listening");
});
