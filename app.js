if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate"); //use to make template like navbar which show on other ejs template (layouts in views folder)
const expressError = require("./utils/expressError.js");
const listingsRoute = require("./routes/listings.js");
const reviewsRoute = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const usersRoute = require("./routes/users.js");
const Listing = require("./models/listing.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));

// const mongoURL = "mongodb://127.0.0.1:27017/nestaway";
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then((res) => console.log("Database is connected"))
  .catch((err) => console.log("Error in Database connection"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in mongo Store :", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
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
  res.locals.currentUser = req.user;
  next();
});

app.get("/demouser", async (req, res) => {
  let demoUser = new User({
    email: "jassiPaji1234@gmail.com",
    username: "JassiPaji",
  });

  let newUser = await User.register(demoUser, "nikshap");
  res.send(newUser);
  console.log(newUser);
});

app.get("/", async (req, res) => {
  const AllListing = await Listing.find();
  res.render("listings/index.ejs", { AllListing });
});

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

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
