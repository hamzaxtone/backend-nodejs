var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
    url: String,
    publicId: String
});
module.exports = mongoose.model('Image', Image);