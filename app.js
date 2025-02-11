const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

const mongoURL = "mongodb://127.0.0.1:27017/nestaway";
app.set("view engine", "ejs");
app.set("ejs", path.join(__dirname, "views"));
app.use(express.urlencoded({ Extended: true }));
app.use(methodOverride("_method"));

async function main() {
  await mongoose.connect(mongoURL);
}

main()
  .then((res) => console.log("Database is connected"))
  .catch((err) => console.log("Error in Database connection"));

app.get("/", (req, res) => {
  res.send("Root");
});

// index route
app.get("/listings", async (req, res) => {
  const AllListing = await Listing.find();
  res.render("listings/index.ejs", { AllListing });
});

// add new listing

//this get should be before show route otherwise new will be considered as id and cause an error
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post("/listings", async (req, res) => {
  const newListing = await new Listing(req.body.listing);
  newListing.save();
  res.redirect("/listings");
});

//Edit route

app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

app.put("/listings", async (req, res) => {
  await Listing.findByIdAndUpdate(req.body.listing.id, req.body.listing);
  res.redirect("/listings");
});

//Delete route

app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  res.redirect("/listings");
});

// show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let info = await Listing.findById(id);
  res.render("listings/show.ejs", { info });
});

app.listen(3000, () => {
  console.log("App is Listening");
});
