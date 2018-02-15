var mongoose = require("mongoose");

var profilesSchema = new mongoose.Schema({
   profilePicture: String,
   profilePicture_id: String,
   intro: String,
   owner: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}]
});

module.exports = mongoose.model("Profiles", profilesSchema);