const User=require("../models/user")

module.exports.renderSignupForm=(req, res) => {
  res.render("user/signup.ejs");
}

module.exports.signup=async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser,(err)=>{
        if(err){
          return next (err);
        }
        req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
      });
      
    } catch (e) {
      req.flash("error", e.massage);
      res.redirect("/signup");
    }
  }

  module.exports.renderLoginForm=(req, res) => {
  res.render("user/login.ejs");
}

module.exports.login= async (req, res) => {
    req.flash("success","welcome to wanderlust! you are logged in");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect("/listings");
  }

  module.exports.logout=(req,res,next)=>{
  req.logout((err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","you are logged out!")
      res.redirect("/listings");
  })
}