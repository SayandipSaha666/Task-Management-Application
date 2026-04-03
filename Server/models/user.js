const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

/*
IF a model named "user" already exists
      use the existing model
ELSE
      create a new model named user based on the UserSchema
*/

const User = mongoose.models.User || mongoose.model("User",UserSchema,"Users")

module.exports = User; // Use it to interact with the users collection in MongoDB.