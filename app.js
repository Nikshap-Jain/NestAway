const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate"); //use to make template like navbar which show on other ejs template (layouts in views folder)
const expressError = require("./utils/expressError.js");
const mongoURL = "mongodb://127.0.0.1:27017/nestaway";
const listings = require("./routes/listings.js");
const reviews = require("./routes/reviews.js");

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
app.use("/listings/:id/reviews", reviews);

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
