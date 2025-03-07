const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

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

      req.login(user, (err) => {
        if (err) {
          return next(err);
        } else {
          req.flash("success", "Welcome to Nestaway");
          res.redirect("/listings");
        }
      });
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
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Nestaway ");
    let redirectURL = res.locals.redirectUrl || "/listings";
    res.redirect(redirectURL);
  }
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logout successfully");
    res.redirect("/listings");
  });
});

module.exports = router;
