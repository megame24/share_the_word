var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
   text: String,
   image: String,
   image_id: String,
   date: String,
   title: String,
   owner: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
});

module.exports = mongoose.model("Post", postSchema);