const User = require("../models/user");

module.exports.signup = async (req, res) => {
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
};

module.exports.renderSignup = (req, res) => {
  res.render("users/users.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Nestaway ");
  let redirectURL = res.locals.redirectUrl || "/listings";
  res.redirect(redirectURL);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logout successfully");
    res.redirect("/listings");
  });
};
