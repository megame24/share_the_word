var express = require("express");
var router = express.Router({paramsEmbed: true});
var Post = require("../models/post.js");
var Comment = require("../models/comment.js");
var Reply = require("../models/reply.js");
var Reply1 = require("../models/reply1.js");
var Profile = require("../models/profile.js");
var multer = require("multer");
var path = require("path");
var fs = require('file-system');
var cloudinary = require('cloudinary');


cloudinary.config({ 
  cloud_name: 'cloud_name', 
  api_key: 'api_key', 
  api_secret: 'api_secret' 
});


//set storage engine
var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + req.user._id + "-" + Date.now() + path.extname(file.originalname));
    }
});

//Init upload
var upload = multer({
    storage: storage,
    limits: {fileSize: 2000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single("postPic");

//check file type
function checkFileType(file, cb){
    //allowed file type
    var fileTypes = /jpeg|jpg|png|gif/;
    //check ext
    var extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    //check mimtype
    var mimetype = fileTypes.test(file.mimetype);
    
    if(mimetype && extName){
        return cb(null, true);
    } else {
        cb("Error: Images only");
    }
}


//getting a profile
router.post("/", function(req, res){
  
  upload(req, res, function(err){
    if(err){
       console.log(err);
       req.flash("error", "Something went wrong");
       res.redirect("/");
    } else {
      var date = new Date();
      var reqImage = "";
      var reqImage_id = "";
      var post = {};
      if(req.file !== undefined){
        cloudinary.v2.uploader.upload("./public/uploads/" + req.file.filename,
        { width: 506, crop: "fit", quality: "auto:eco" },
        function(error, result) {
            if(error){
                console.log(error);
            } else {
                console.log(result);
                reqImage_id = result.public_id;
                reqImage = result.secure_url;
                console.log(reqImage);
                console.log(reqImage_id);
                post = {
                  title: req.body.title,
                  image: reqImage,
                  image_id: reqImage_id,
                  text: req.body.text,
                  date: date.toDateString(),
                  owner: {
                    id: res.locals.currentUser._id,
                    username: res.locals.currentUser.username
                  }
                };
                Post.create(post, function(err, post){
                  if(err){
                    console.log(err);
                  } else {
                    Profile.findOne({"owner.username" : res.locals.currentUser.username}, function(err, profile){
                      if(err){
                        console.log(err);
                      } else {
                        profile.posts.push(post._id);
                        profile.save();
                        res.redirect("/" + profile.owner.username);
                      }
                    });
                  }
                });
                fs.unlink("public/uploads/" + req.file.filename);
            }
        });
      } else {
        reqImage = null;
        reqImage_id = null;
        post = {
          title: req.body.title,
          image: reqImage,
          image_id: reqImage_id,
          text: req.body.text,
          date: date.toDateString(),
          owner: {
            id: res.locals.currentUser._id,
            username: res.locals.currentUser.username
          }
        };
        Post.create(post, function(err, post){
          if(err){
            console.log(err);
          } else {
            Profile.findOne({"owner.username" : res.locals.currentUser.username}, function(err, profile){
              if(err){
                console.log(err);
              } else {
                profile.posts.push(post._id);
                profile.save();
                res.redirect("/" + profile.owner.username);
              }
            });
          }
        });
      }
      
    }
  });
    
});


router.get("/:id/edit", function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
    } else {
      res.render("edit-post", {post: post});
    }
  });
});

router.delete("/:id/delete", function(req, res){
  
  //find a way to delete the comments and remove schema references when calling a delete route !important
  
  Post.findById(req.params.id, function(err, post){
    if(err){
      console.log(err);
    } else {
        if(post.image !== null){
          cloudinary.v2.uploader.destroy(post.image_id, function(error, result){console.log(result)});
          if(post.comments.length !== 0) {
            post.comments.forEach(function(id){
              removeComments(id, function(){
                Post.findByIdAndRemove(req.params.id, function(err) {
                    if(err){
                      console.log(err);
                    } else {
                      res.redirect("/" + req.user.username);
                    }
                });
              });
            });
          }
        } else {
          Post.findByIdAndRemove(req.params.id, function(err){
            if(err){
              console.log(err);
            } else {
              res.redirect("/" + req.user.username);
            }
          });
        }
    }
  });
  
});

function removeComments(id, cb) {
  Comment.findById(id, function(err, comment){
    if(err) console.log(err);
    else {
      if(comment.replies.length !== 0) {
        var doAndCb = function(cb) {
          comment.replies.forEach(function(id){
            removeReply(id);
          });
          cb();
        };
        doAndCb(function(){
          Comment.findByIdAndRemove(id, function(err){
            if(err) console.log(err);
          });
        });
      } else {
        Comment.findByIdAndRemove(id, function(err){
          if(err) console.log(err);
        });
      }
    }
  });
  cb();
}

function removeReply(id) {
  Reply.findById(id, function(err, reply){
    if(err) console.log(err);
    else {
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
  });
}

function removeReply1(id){
  Reply1.findByIdAndRemove(id, function(err) {
      if(err) console.log(err);
  });
}

router.put("/:id/edit", function(req, res){
    upload(req, res, function(err){
     if(err){
         console.log(err);
         req.flash("error", "Something went wrong");
         res.redirect("/");
     }  else {
        console.log(req.body);
        if(req.body["image?"] == "true"){
          Post.findById(req.params.id, function(err, post){
            if(err){
                console.log(err);
            } else {
                var doAndCb = function(cb) {
                    cloudinary.v2.uploader.destroy(post.image_id, function(error, result){console.log(result)});
                   cb();
                };
                doAndCb(function(){
                  cloudinary.v2.uploader.upload("./public/uploads/" + req.file.filename,
                  { width: 506, crop: "fit", quality: "auto:eco" },
                  function(error, result) {
                      if(error){
                          console.log(error);
                      } else {
                        console.log(result);
                        post.image_id = result.public_id;
                        post.image = result.secure_url;
                        post.text = req.body.text;
                        post.title = req.body.title;
                        post.save(function(err){
                            if(err){
                                console.log(err);
                            }
                        });
                        req.flash("sucess", "Post edited sucessfully");
                        res.redirect("/" + post.owner.username);
                      }
                  });
                });
                fs.unlink("public/uploads/" + req.file.filename);
            }
            
         });
        } else if(req.body["image?"] == "retain") {
          Post.findById(req.params.id, function(err, post){
            if(err){
                console.log(err);
            } else {
                post.text = req.body.text;
                post.title = req.body.title;
                post.save(function(err){
                    if(err){
                        console.log(err);
                    }
                });
                req.flash("sucess", "Post edited sucessfully");
                res.redirect("/" + post.owner.username);
                
            }
            
          });
        } else {
          Post.findById(req.params.id, function(err, post){
            if(err){
                console.log(err);
            } else {
                cloudinary.v2.uploader.destroy(post.image_id, function(error, result){console.log(result)});
                post.image = null;
                post.image_id = null;
                post.text = req.body.text;
                post.title = req.body.title;
                post.save(function(err){
                    if(err){
                        console.log(err);
                    }
                });
                req.flash("sucess", "Post edited sucessfully");
                res.redirect("/" + post.owner.username);
                
            }
            
         });
        }
         
     }
   });
});


module.exports = router;