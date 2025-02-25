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

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((info) => info.message).join(",");
    throw new expressError(400, errMsg);
  }
  next();
};

const validateReview = (req, res, next) => {
  console.log(req.body);
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((info) => info.message).join(",");
    throw new expressError(400, errMsg);
  }
  next();
};
// index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const AllListing = await Listing.find();
    res.render("listings/index.ejs", { AllListing });
  })
);

// add new listing

//this get should be before show route otherwise new will be considered as id and cause an error
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    console.log("Received request body:", req.body); // Add this line
    const newListing = await new Listing(req.body.listing);
    await newListing.save();
    console.log("Saved listing:", newListing); // Add this line
    res.redirect("/listings");
  })
);

//Edit route

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

app.put(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.body.listing.id, req.body.listing);
    res.redirect("/listings");
  })
);

//Delete route

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
  })
);

// show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let info = await Listing.findById(id);
    res.render("listings/show.ejs", { info });
  })
);

//Review
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    console.log(req.body);
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

//If there is a incorrect route it handled here

app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not found , route don't exits"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went wrong" } = err;
  // res.status(statusCode).send(message);
  res.render("listings/error.ejs", { err });
});

app.listen(3000, () => {
  console.log("App is Listening");
});
