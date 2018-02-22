var Campgrounds = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = {};

middleware.hasProfileAuthorization = function(req, res, next){
    Campgrounds.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
            res.redirect("back");
        } else{
            if(req.isAuthenticated()){
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else{
                    res.redirect("back");
                }
            } else{
                res.redirect("back");
            }
        }
    });
};

middleware.hasCommentAuthorization = function(req, res, next){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log(err);
            res.redirect("back");
        } else{
            if(req.isAuthenticated()){
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    res.redirect("back");
                }
            } else{
                res.redirect("back");
            }
        }
    });
};

middleware.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Pls login");
    res.redirect("/login");
};

module.exports = middleware;