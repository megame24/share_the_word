var express = require("express");
var multer = require("multer");
var router = express.Router({});
var User = require("../models/user");
var Profile = require("../models/profile");
var Post = require("../models/post");
var path = require("path");
var fs = require('file-system');
var cloudinary = require('cloudinary');


cloudinary.config({ 
  cloud_name: 'cloud_name', 
  api_key: 'api_key', 
  api_secret: 'api_secret' 
});

// cloudinary.v2.uploader.upload("./public/uploads/defaultPP.png", 
// { width: 200, height: 200, crop: "thumb", quality: "auto:good", radius: "max" }, function(error, result){
//     if(error) console.log(error);
//     console.log(result);
//  });

// console.log(cloudinary.image("gx1gqcpepis7ng1kwlbb.png", { width: 100, height: 100, quality: "auto:low" }));
// cloudinary.v2.uploader.destroy('qm3s09dmg9zacrp3efpn', function(error, result){console.log(result)});
// cloudinary.uploader.destroy('gx1gqcpepis7ng1kwlbb.png', function(result) { console.log(result) });

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
}).single("profilePic");

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

router.get("/profile-img-upload", function(req, res){
   res.render("profile-picture");
});


router.put("/profile-img-upload", function(req, res){
   upload(req, res, function(err){
     if(err){
         console.log(err);
         req.flash("error", "Something went wrong");
         res.redirect("/");
     }  else {
         Profile.findOne({"owner.username" : res.locals.currentUser.username}, function(err, profile){
            if(err){
                console.log(err);
            } else {
                var profilePicDelete = profile.profilePicture;
                if(profilePicDelete !== undefined && profilePicDelete !== "defaultPP.png"){
                   cloudinary.v2.uploader.destroy(profile.profilePicture_id, function(error, result){console.log(result)});
                }
                cloudinary.v2.uploader.upload("./public/uploads/" + req.file.filename,
                { width: 200, height: 200, crop: "thumb", quality: "auto:good", radius: "max" },
                function(error, result) {
                    if(error){
                        console.log(error);
                    } else {
                        console.log(result);
                        profile.profilePicture_id = result.public_id;
                        profile.profilePicture = result.secure_url;
                        console.log(profile.profilePicture);
                        profile.save(function(err){
                            if(err){
                                console.log(err);
                            }
                        });
                        req.flash("sucess", "profile picture updated sucessfully");
                        res.redirect("/" + profile.owner.username);
                        fs.unlink("public/uploads/" + req.file.filename);
                    }
                });
            }
            
         });
        //  console.log(req.file);
        //  req.flash("success", "success");
        //  res.redirect("/");
     }
   });
});

module.exports = router;