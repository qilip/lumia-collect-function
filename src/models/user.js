const mongoose = require('mongoose');
const { Schema } = mongoose;

const Playdata = require('./playdata.js');

const User = new Schema({
  userNum: { type: Number, index: true, required: true },
  nickname: { type: String, unique: true, required: true },
  userRank: [{
    _id: false,
    matchingTeamMode: Number,
    seasonId: Number,
    mmr: Number,
    rank: Number
  }],
  userStats: [{
    _id: false,
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
      _id: false,
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
  collectedGamesId: [Number]
}, { timestamps: true });

// Model methods

User.statics.findByNickname = function (nickname) {
  return this.findOne({nickname}).exec();
};

User.statics.findByUserNum = function (userNum) {
  return this.findOne({userNum}).exec();
};

User.statics.create = function (userData) {
  const user = new this(userData);
  return user.save();
};

User.statics.update = function (userDoc, newData) {
  if(newData.nickname && userDoc.nickname !== newData.nickname)
    userDoc.nickname = newData.nickname;
  if(newData.recentGames)
    userDoc.recentGames = newData.recentGames;
  // 나중에 고치기..
  if(newData.userRank){
    newData.userRank.map(
      (newRank) => {
        const existRank = userDoc.userRank.findIndex(
          (rank) => ((rank.seasonId === newRank.seasonId) && (rank.matchingTeamMode === newRank.matchingTeamMode))
        );
        if(existRank !== -1){
          userDoc.userRank[existRank] = newRank;
        }else{
          userDoc.userRank.push(newRank);
        }
      }
    );
    userDoc.markModified('userRank');
  }
  if(newData.userStats){
    newData.userStats.map(
      (newStats) => {
        const existStats = userDoc.userStats.findIndex(
          (stats) => ((stats.seasonId === newStats.seasonId) && (stats.matchingTeamMode === newStats.matchingTeamMode))
        );
        if(existStats !== -1){
          userDoc.userStats[existStats] = newStats;
        }else{
          userDoc.userStats.push(newStats);
        }
      }
    );
    userDoc.markModified('userStats');
  }
  
  if(newData.recentGames)
    userDoc.recentGames = newData.recentGames;
  if(newData.collectedGamesId){
    newData.collectedGamesId.push(...userDoc.collectedGamesId);
    userDoc.collectedGamesId = [...new Set(newData.collectedGamesId)];
    userDoc.markModified('collectedGamesId');
  }
  
  return userDoc.save();
};

User.statics.changeNickname = function (userDoc, nickname) {
  userDoc.nickname = nickname;
  userDoc.save();
};

global.User = global.User || mongoose.model('User', User);
module.exports = global.User;
