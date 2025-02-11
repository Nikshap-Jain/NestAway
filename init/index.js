const mongoose = require("mongoose");
const mongoURL = "mongodb://127.0.0.1:27017/nestaway";
const initData = require("./init.js");
const Listing = require("../models/listing.js"); //.. means go back one directory

async function main() {
  await mongoose.connect(mongoURL);
}

main()
  .then((res) => console.log("Database is connected"))
  .catch((err) => console.log("Error in Database connection"));

const dbint = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Data is initialized");
};

dbint();
