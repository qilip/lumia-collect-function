const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = new Schema({}, { timestamps: true, strict: false });

global.Playdata = global.Playdata || mongoose.model('Playdata', Playdata);
module.exports = global.Playdata;
