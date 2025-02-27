const mongoose = require("mongoose");
const Review = require("./reviews.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: { type: String, default: "listingImg" },
    url: {
      type: String,
      default:
        "https://unsplash.com/photos/white-and-grey-concrete-building-near-swimming-pool-under-clear-sky-during-daytime-2d4lAQAlbDA",
      set: (v) =>
        v === ""
          ? "https://unsplash.com/photos/white-and-grey-concrete-building-near-swimming-pool-under-clear-sky-during-daytime-2d4lAQAlbDA"
          : v,
    },
  },
  price: { type: Number, required: true },
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//DeleteMiddleware for simultaneous deletion of reviews with listing
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
