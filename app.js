var express = require("express"),
    morgan  = require("morgan"),
    app     = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStratagy = require("passport-local"),
    User = require("./models/user"),
    flash = require("connect-flash"),
    methodOverride = require('method-override'),
    bodyParser = require("body-parser");

//routes
var indexRoutes = require("./routes/index"),
    profileRoutes = require("./routes/profile"),
    uploadsRoutes = require("./routes/uploads"),
    postRoutes = require("./routes/post"),
    commentRoutes = require("./routes/comment"),
    replyRoutes = require("./routes/reply");

var devEnviro = require('./config/devEnviro');

//connect to mongoose
mongoose.Promise = global.Promise;
mongoose.connect(devEnviro.database.uri, {useMongoClient: true}, (err) => {
    if(err) console.log(err);
    else console.log(`connected to database: ${devEnviro.database.db}`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(methodOverride('_method'));

//configuring passport
app.use(require("express-session")({
    secret: "Jesus",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   return next();
});

//using routes
app.use("/", indexRoutes);
app.use("/", uploadsRoutes);
app.use("/", profileRoutes);
app.use("/post", postRoutes);
app.use("/", commentRoutes);
app.use("/", replyRoutes);

app.listen(3000, function(){
   console.log("server started, listening at port 3000"); 
});