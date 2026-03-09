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

const user = mongoose.models.user || mongoose.model("user",UserSchema)

module.exports = user; // Use it to interact with the users collection in MongoDB.