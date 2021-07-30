const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = require('./playdata.js').Schema;

const Game = mongoose.Schema({
  gameId: Number,
  seasonId: Number,
  matchingMode: Number,
  matchingTeamMode: Number,
  versionMajor: Number,
  versionMinor: Number,
  serverName: String,
  startDtm: Date,
  botAdded: Number,
  botRemain: Number,
  restrictedAreaAccelerated: Number,
  safeAreas: Number,
  preMade: Number,
  mmrAvg: Number,
  playdata: [Playdata]
}, { timestamps: true });

global.Game = global.Game || mongoose.model('Game', Game);
module.exports = global.Game;
