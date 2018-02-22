var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
   text: String,
   ownerImage: String,
   owner: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   post: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Post"
      }
   },
   replies: [{type: mongoose.Schema.ObjectId, ref: "Reply"}]
});

module.exports = mongoose.model("Comment", commentSchema);