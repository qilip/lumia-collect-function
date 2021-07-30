const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = require('./playdata.js');

const User = new Schema({
  userNum: Number,
  nickname: String,
  userRank: [{
    matchingTeamMode: Number,
    seasonId: Number,
    mmr: Number,
    rank: Number
  }],
  userStats: [{
    seasonId: Number,
    matchingMode: Number,
    matchingTeamMode: Number,
    mmr: Number,
    rank: Number,
    rankSize: Number,
    totalGames: Number,
    totalWins: Number,
    totalTeamKills: Number,
    rankPercent: Number,
    averageRank: Number,
    averageKills: Number,
    averageAssistants: Number,
    averageHunts: Number,
    top1: Number,
    top2: Number,
    top3: Number,
    top5: Number,
    top7: Number,
    characterStats: [{
      characterCode: Number,
      totalGames: Number,
      usages: Number,
      maxKillings: Number,
      top3: Number,
      wins: Number,
      top3Rate: Number,
      averageRank: Number
    }]
  }],
  recentGames: [Playdata],
  recentGamesNext: Number,
  collectedGamesId: [Number]
}, { timestamps: true });

// Model methods

User.statics.findByNickname = (nickname) => {
  return this.findOne({nickname}).exec();
};

User.statics.findByUserNum = (userNum) => {
  return this.findOne({userNum}).exec();
};

User.statics.newUser = (userData) => {
  const user = new this({
    userNum,
    nickname,
    userRank: userData.data,
    userStats
    
  });
  return user.save();
};

global.User = global.User || mongoose.model('User', User);
module.exports = global.User;
