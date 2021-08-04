const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = require('./playdata.js');

const Game = new Schema({
  gameId: { type: Number, unique: true, required: true },
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

Game.statics.findByGameId = function (gameId) {
  return this.findOne({gameId}).exec();
};

Game.statics.create = function (gameData) {
  const game = new this(gameData);
  return game.save();
};

Game.statics.update = function (gameDoc, gameData) {
  if(gameData) Object.assign(gameDoc, gameData);
  return gameDoc.save();
};

global.Game = global.Game || mongoose.model('Game', Game);
module.exports = global.Game;
