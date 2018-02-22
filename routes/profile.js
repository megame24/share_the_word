var express = require("express");
var router = express.Router({paramsEmbed: true});
var Profile = require("../models/profile.js");
var Post = require("../models/post.js");

//getting a profile
router.get("/:username", function(req, res){
    Profile.findOne({"owner.username" : req.params.username}).populate({
      path: "posts",
      model: "Post",
      populate: {
        path: "comments",
        model: "Comment",
        populate: {
          path: "replies",
          model: "Reply",
          populate: {
            path: "replies",
            model: "Reply1"
          }
        }
      }
    }).exec(function(err, profile){
      if(err){
          console.log(err);
      } else{
          if(profile == undefined){
              req.flash("error", "the link has expired");
              res.redirect("/");
          } else {
              res.render("profile", {profile: profile});
          }
      }
   });
});

module.exports = router;