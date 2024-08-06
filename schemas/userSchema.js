const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = { type: String, required: true };
const nonReqString = { type: String, required: false };

const userSchema = new Schema({
    name: reqString,
    username: reqString,
    password: reqString,
    proxy: {
        type: String,
        required: true,
        default: 'none'
    }
})

module.exports = mongoose.model("User", userSchema)