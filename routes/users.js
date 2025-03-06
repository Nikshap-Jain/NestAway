const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

//rendering form
router.get("/signup", (req, res) => {
  res.render("users/users.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      let newUser = new User({
        username: username,
        email: email,
      });

      let user = await User.register(newUser, password);
      console.log(user);
      req.flash("success", "Welcome to Nestaway");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Nestaway ");
    res.redirect("/listings");
  }
);
module.exports = router;
