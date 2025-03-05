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
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

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

const sessionOptions = {
  secret: "nikshapjain",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secret: "nikshap",
    expires: Date.now() + 14 * 24 * 60 * 1000,
    maxAge: 14 * 24 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

//Authentication
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
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
