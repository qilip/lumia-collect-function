const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = new Schema({
  gameId: { type: Number, index: true, required: true }
}, { timestamps: true, strict: false });

exports = Playdata;
