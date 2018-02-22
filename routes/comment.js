var express = require("express");
var router = express.Router({paramsEmbed: true});
var Post = require("../models/post.js");
var Profile = require("../models/profile.js");
var Comment = require("../models/comment.js");
var Reply = require("../models/reply");
var Reply1 = require('../models/reply1');
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
                post: {
                    id: req.params.id
                }
            };
            Comment.create(newComment, function(err, comment){
               if(err){
                   console.log(err);
               } else {
                   Post.findOneAndUpdate(
                    {_id: req.params.id},
                    {$push: {comments: comment}},
                    {new: true},
                    function(err){
                        if(err) console.log(err);
                        res.redirect('back');
                    });
                //    Post.findById(req.params.id, function(err, post){
                //       if(err){
                //           console.log(err);
                //       } else {
                //           post.comments.push(comment);
                //           post.save(function(err){
                //              if(err){
                //                  console.log(err);
                //              } else {
                //                  res.redirect("back");
                //              }
                //           });
                //       }
                //    });
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
    Comment.findById(req.params.id, function(err, comment){
        if(err){
          console.log(err);
        } else {
            Post.findOneAndUpdate(
                {_id: comment.post.id},
                {$pull: {comments: comment._id}},
                function(err, post){
                    if(err) console.log(err);
                    if(comment.replies.length !== 0) {
                        removeReply(comment, function(){
                        Comment.findByIdAndRemove(req.params.id, function(err) {
                            if(err){
                                console.log(err);
                            } else {
                                res.redirect("/" + req.user.username);
                            }
                        });
                    });
                    } else {
                        Comment.findByIdAndRemove(req.params.id, function(err) {
                            if(err){
                            console.log(err);
                            } else {
                            res.redirect("/" + req.user.username);
                            }
                        });
                    }
                }
            );
        }
      });
//    Comment.findByIdAndRemove(req.params.id, function(err){
//        if(err){
//            console.log(err);
//        } else {
//            res.redirect("back");
//        }
//    });
});

function removeReply(comment, cb) {
    comment.replies.forEach(function(id){
        Reply.findById(id, function(err, reply){
        if(err) console.log(err);
        else {
            if(reply !== null && reply !== undefined) {
              if(reply.replies.length !== 0) {
                var doAndCb = function(cb) {
                  reply.replies.forEach(function(id){
                    removeReply1(id);
                  });
                  cb();
                };
                doAndCb(function(){
                  Reply.findByIdAndRemove(id, function(err){
                    if(err) console.log(err);
                  });
                });
              } else {
                Reply.findByIdAndRemove(id, function(err){
                  if(err) console.log(err);
                });
              }
            }
          }
        });
    });
    cb();
  }
  
  function removeReply1(id){
    Reply1.findByIdAndRemove(id, function(err) {
        if(err) console.log(err);
    });
  }

module.exports = router;