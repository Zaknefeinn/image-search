var mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
        term: String,
        when: Date
});

module.exports = mongoose.model("history", historySchema);