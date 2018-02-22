var mongoose = require("mongoose");

var reply1Schema = mongoose.Schema({
   text: String,
   ownerImage: String,
   owner: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   reply: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Reply"
      }
   }
});

module.exports = mongoose.model("Reply1", reply1Schema);