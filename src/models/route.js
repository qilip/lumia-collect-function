const mongoose = require('mongoose');
const { Schema } = mongoose;

const Route = new Schema({
  id: { type: Number, unique: true, required: true },
  title: String,
  userNum: Number,
  userNickname: String,
  characterCode: Number,
  slotId: Number,
  weaponType: Number,
  weaponCodes: String,
  paths: String,
  count: Number,
  version: String,
  teamMode: Number,
  languageCode: String,
  routeVersion: Number,
  like: Number,
  unLike: Number,
  likeScore: Number,
  unLikeScore: Number,
  accumulateLike: Number,
  accumulateUnLike: Number,
  accumulateLikeScore: Number,
  accumulateUnLikeScore: Number,
  share: Boolean,
  updateDtm: Date,
  starScore: Number,
  accumulateStarScore: Number,
  recommendWeaponRouteId: Number,
  skillPath: String,
  descTitle: String,
  desc: String
}, { timestamps: true });

Route.statics.findByRouteId = function (routeId) {
  return this.findOne({routeId}).exec();
};

Route.statics.create = function (routeData) {
  const route = new this(routeData);
  return route.save();
};

Route.statics.update = function (routeDoc, routeData) {
  if(routeData.routeVersion && routeDoc.routeVersion < routeData.routeVersion)
    routeDoc = routeData;
  return routeDoc.save();
};

global.Route = global.Route || mongoose.model('Route', Route);
module.exports = global.Route;
