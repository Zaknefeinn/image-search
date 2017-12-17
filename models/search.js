var mongoose = require("mongoose");

var searchSchema = new  mongoose.Schema({
    url: String,
    snippet: String,
    thumbnail: String,
    context: String
});

module.exports = mongoose.model("search", searchSchema);