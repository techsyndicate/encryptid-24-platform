const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = { type: String, required: true };
const nonReqString = { type: String, required: false };

const userSchema = new Schema({
    name: reqString,
    email: reqString,
    password: reqString,
    proxy: {
        type: String,
        required: true,
        default: 'none'
    },
    logs: {
        type: Array,
        required: true,
        default: []
    },
    lastAnswered: {
        type: Number,
        required: true,
        default: 0
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    banned: {
        type: Boolean,
        required: true,
        default: false
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    solves: {
        type: Array,
        required: true,
        default: []
    },
})

module.exports = mongoose.model("User", userSchema)