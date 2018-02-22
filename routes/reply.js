var express = require("express");
var router = express.Router({paramsEmbed: true});
var Post = require("../models/post.js");
var Profile = require("../models/profile.js");
var Comment = require("../models/comment.js");
var Reply = require("../models/reply.js");
var Reply1 = require("../models/reply1.js");

router.post("/reply/:id", function(req, res){
    Profile.findOne({"owner.username" : req.user.username}, function(err, profile){
       if(err){
           console.log(err);
       } else {
           var ownerImage = profile.profilePicture;
           var newReply = {
                text: req.body.text,
                ownerImage: ownerImage,
                owner: {
                  id: req.user._id,
                  username: req.user.username
                },
                comment:{
                    id: req.params.id
                }
            };
            Reply.create(newReply, function(err, reply){
               if(err){
                   console.log(err);
               } else {
                    Comment.findOneAndUpdate(
                    {_id: req.params.id},
                    {$push: {replies: reply}},
                    {new: true},
                    function(err){
                        if(err) console.log(err);
                        res.redirect('back');
                    });
                //    Comment.findById(req.params.id, function(err, comment){
                //       if(err){
                //           console.log(err);
                //       } else {
                //           comment.replies.push(reply);
                //           comment.save(function(err){
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

router.get("/reply/:id/edit", function(req, res){
   Reply.findById(req.params.id, function(err, reply){
      if(err){
          console.log(err);
      } else {
          res.render("edit-reply", {reply: reply});
      }
   });
});

router.put("/reply/:id/edit", function(req, res){
   Reply.findById(req.params.id, function(err, reply){
       if(err){
           console.log(err);
       } else {
           reply.text = req.body.text;
           reply.save(function(err){
              if(err){
                  console.log(err);
              } else {
                  res.redirect("back");
              }
           });
       }
   });
});

router.delete("/reply/:id/delete", function(req, res){
    Reply.findById(req.params.id, function(err, reply){
        if(err) console.log(err);
        Comment.findOneAndUpdate(
            {_id: reply.comment.id},
            {$pull: {replies: reply._id}},
            function(err, comment){
                if(err) console.log(err);
                if(reply.replies.length !== 0){
                    removeReply1(reply, function(){
                        Reply.findByIdAndRemove(req.params.id, function(err){
                            if(err){
                                console.log(err);
                            } else {
                                res.redirect("back");
                            }
                        });
                    });
                } else {
                    Reply.findByIdAndRemove(req.params.id, function(err){
                        if(err){
                            console.log(err);
                        } else {
                            res.redirect("back");
                        }
                    });
                }
            }
        );
        
    });
   
});

function removeReply1(reply, cb){
    reply.replies.forEach(function(id){
        Reply1.findByIdAndRemove(id, function(err) {
            if(err) console.log(err);
        });
    });
    cb();
}

router.post("/reply/:id/:id_1", function(req, res){
    Profile.findOne({"owner.username" : req.user.username}, function(err, profile){
       if(err){
           console.log(err);
       } else {
           var ownerImage = profile.profilePicture;
           var newReply = {
                text: req.body.text,
                ownerImage: ownerImage,
                owner: {
                  id: req.user._id,
                  username: req.user.username
                },
                reply: {
                    id:req.params.id_1
                }
            };
            Reply1.create(newReply, function(err, reply1){
               if(err){
                   console.log(err);
               } else {
                    Reply.findOneAndUpdate(
                    {_id: req.params.id_1},
                    {$push: {replies: reply1}},
                    {new: true},
                    function(err){
                        if(err) console.log(err);
                        res.redirect('back');
                    });
                //    Reply.findById(req.params.id_1, function(err, reply){
                //       if(err){
                //           console.log(err);
                //       } else {
                //           reply.replies.push(reply1);
                //           reply.save(function(err){
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


router.get("/reply/:id/:id_1/edit", function(req, res){
   Reply1.findById(req.params.id_1, function(err, reply){
      if(err){
          console.log(err);
      } else {
          res.render("edit-reply1", {reply: reply});
      }
   });
});

router.put("/reply/:id/:id_1/edit", function(req, res){
   Reply1.findById(req.params.id_1, function(err, reply){
       if(err){
           console.log(err);
       } else {
           reply.text = req.body.text;
           reply.save(function(err){
              if(err){
                  console.log(err);
              } else {
                  res.redirect("back");
              }
           });
       }
   });
});

router.delete("/reply/:id/:id_1/delete", function(req, res){
    Reply1.findById(req.params.id_1, function(err, reply1){
        if(err) console.log(err);
        Reply.findOneAndUpdate(
            {_id: reply1.reply.id},
            {$pull: {replies: reply1._id}},
            function(err, reply){
                if(err) console.log(err);
                Reply1.findByIdAndRemove(req.params.id_1, function(err){
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect("back");
                    }
                });
            }
        );
    });
   
});

module.exports = router;