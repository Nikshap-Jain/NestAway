const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const AllListing = await Listing.find();
  res.render("listings/index.ejs", { AllListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req, res) => {
  console.log("Received request body:", req.body); // Add this line
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  console.log("Saved listing:", newListing); // Add this line
  req.flash("success", "New Listing is added successfully");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  req.flash("success", "Listing is updated successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing is deleted successfully");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let info = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  console.log(info);
  if (!info) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { info });
};
