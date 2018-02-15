var express = require("express");
var router = express.Router({paramsEmbed: true});
var Post = require("../models/post.js");
var Profile = require("../models/profile.js");
var Comment = require("../models/comment.js");
// var Reply = require("../models/reply.js");

router.post("/comment/:id", function(req, res){
    Profile.findOne({"owner.username" : req.user.username}, function(err, profile){
       if(err){
           console.log(err);
       } else {
           var ownerImage = profile.profilePicture;
           var newComment = {
                text: req.body.text,
                ownerImage: ownerImage,
                owner: {
                  id: req.user._id,
                  username: req.user.username
                },
                post: req.params.id
            };
            Comment.create(newComment, function(err, comment){
               if(err){
                   console.log(err);
               } else {
                   Post.findById(req.params.id, function(err, post){
                      if(err){
                          console.log(err);
                      } else {
                          post.comments.push(comment);
                          post.save(function(err){
                             if(err){
                                 console.log(err);
                             } else {
                                 res.redirect("back");
                             }
                          });
                      }
                   });
               }
            });
           }
    });
    
});

router.get("/comment/:id/edit", function(req, res){
  Comment.findById(req.params.id, function(err, comment){
    if(err){
      console.log(err);
    } else {
      res.render("edit-comment", {comment: comment});
    }
  });
});

router.put("/comment/:id/edit", function(req, res){
   Comment.findById(req.params.id, function(err, comment){
       if(err){
           console.log(err);
       } else {
           comment.text = req.body.text;
           comment.save(function(err){
              if(err){
                  console.log(err);
              } else {
                  res.redirect("back");
              }
           });
       }
   });
});

router.delete("/comment/:id/delete", function(req, res){
   Comment.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
       } else {
           res.redirect("back");
       }
   });
});

module.exports = router;