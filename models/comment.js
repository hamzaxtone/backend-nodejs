var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Comment = new Schema({
    comment: String,
    imageId: String
});
module.exports = mongoose.model('Comment', Comment);