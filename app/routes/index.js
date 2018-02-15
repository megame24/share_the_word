var express = require("express");
var router = express.Router({});
var passport = require("passport");
var User = require("../models/user");
var Profile = require("../models/profile");
var Post = require("../models/post");
// var path = require("path");

//landing page
router.get("/", function(req, res){
   res.render("landing"); 
});


//register form
router.get("/register", notLoggedIn, function(req, res){
    res.render("register");
});

//register logic
router.post("/register", notLoggedIn, function(req, res){
    var newUser = new User({
        username: req.body.username,
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            var owner = {
                id: user._id,
                username: user.username
            };
            var newProfile = ({
                profilePicture: 'https://res.cloudinary.com/megame/image/upload/v1516923070/c279oonhoi04blg7rrjj.png',
                owner: owner
            });
            Profile.create(newProfile, function(err, profile){
               if(err){
                   console.log(err);
               }
            });
            res.redirect("/" + req.user.username);
        });
        
    });
});

//login form
router.get("/login", notLoggedIn, function(req, res){
   res.render("login"); 
});

//login logic
router.post("/login", notLoggedIn, passport.authenticate("local", 
    {
        failureRedirect: "/login"
    }
), function(req, res){
    res.redirect("/" + req.body.username);
});

router.get("/feeds", function(req, res){
   Post.find(function(err, posts){
      if(err){
          console.log(err);
      } else {
          res.render("feeds", {posts: posts});
      }
   });
});

//logout route
router.get("/logout",isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/");
});



//checking login authentication
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Not logged in");
    res.redirect("/login");
}

function notLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        req.flash("success", "Already logged in");
        res.redirect("/");
    } else {
        return next();
    }
}

module.exports = router;