var mongoose = require("mongoose");

var replySchema = mongoose.Schema({
   text: String,
   ownerImage: String,
   owner: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comment: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   },
   replies: [{type: mongoose.Schema.ObjectId, ref: "Reply1"}]
});

module.exports = mongoose.model("Reply", replySchema);