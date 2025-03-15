const Listing = require("../models/listing");
const { uploadToCloudinary } = require("../cloudSetup/cloudinaryUpload");

module.exports.index = async (req, res) => {
  const AllListing = await Listing.find();
  res.render("listings/index.ejs", { AllListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req, res) => {
  console.log("This is request.file :", req.file);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // Handle image upload if a file was provided
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "nestaway/listings",
        resource_type: "image",
      });
      // Store the Cloudinary URL and public_id in your listing
      newListing.image = {
        url: result.secure_url,
        filename: result.public_id,
      };

      console.log("Image uploaded to Cloudinary:", result.secure_url);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      req.flash("error", "Failed to upload image");
      // Continue without image if upload fails
    }
  }

  await newListing.save();
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
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  // Update the listing with new data
  Object.assign(listing, req.body.listing);

  // Handle image upload if a file was provided
  if (typeof req.file !== "undefined") {
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "nestaway/listings",
        resource_type: "image",
      });

      // If there was a previous image, you might want to delete it from Cloudinary
      // if (listing.image && listing.image.filename) {
      //   await cloudinary.uploader.destroy(listing.image.filename);
      // }

      // Store the new Cloudinary URL and public_id
      listing.image = {
        url: result.secure_url,
        filename: result.public_id,
      };

      console.log("Updated image uploaded to Cloudinary:", result.secure_url);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      req.flash("error", "Failed to update image");
      // Continue with the existing image if upload fails
    }
  }

  await listing.save();
  req.flash("success", "Listing is updated successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing && listing.image && listing.image.filename) {
    try {
      // Optional: Delete image from Cloudinary when listing is deleted
      // const cloudinary = require('../cloudinaryConfig');
      // await cloudinary.uploader.destroy(listing.image.filename);
      console.log("Deleted image from Cloudinary:", listing.image.filename);
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      // Continue with deletion even if Cloudinary deletion fails
    }
  }

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
  if (!info) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { info });
};
