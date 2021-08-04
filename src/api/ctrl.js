const mongo = require('../connectdb.js');
const er = require('./er.js');
const User = require('../models/user.js');
const Game = require('../models/game.js');
const Route = require('../models/route.js');

exports.getUserInfo = async (nickname, seasonId) => {
  let db = false, userNum, res;
  try{
    res = await Promise.allSettled([
      mongo.connect(),
      er.getUserNum(nickname)
    ]);
    if(res[0].status === 'fulfilled') db = true;
    else console.log('DB connection Error');
    if(res[1].status !== 'fulfilled') return { 'code': 500 };
    if(res[1].value.code === 404) return { 'code': 404 }; // TODO: 제대로 처리하기
    userNum = res[1].value.user.userNum;
    console.log(nickname + ' : ' + userNum);
  }catch(e){
    console.error(e);
  }
  
  if(!userNum) return { 'code' : 500 };
  
  let query = [
    er.getUserStats(userNum, 0), // 노말게임
    er.getUserSeason(userNum, seasonId), // 현재시즌
    er.getUserRecentGames(userNum, 20) // 최근 20게임
  ];
  if(db) query.push(...[
    User.findByNickname(nickname),
    User.findByUserNum(userNum)
  ]);
  try{
    res = await Promise.allSettled(query);
  }catch(e){
    console.error(e);
  }
  if(res[3].status !== 'fulfilled' || res[4].status !== 'fulfilled') db == false;
  const resData = res.slice(0, 3).map(res => {
    if(res.status === 'fulfilled') return res.value;
    else return { 'code' : 500 };
  });
  
  // console.log('LOG: ' + JSON.stringify(resData, 0, 2));
  
  const userRank = [ ...resData[1].userRank ];
  const userStats = [ ...resData[0].userStats, ...resData[1].userStats ];
  const recentGames = [ ...resData[2] ];
  const collectedGamesId = [ ...resData[2].map(game => game.gameId) ];
  const userData = { userNum, nickname, userRank, userStats, recentGames, collectedGamesId };
  
  if(!db) return userData;
  
  const sameNickname = res[3].value;
  const sameUserNum = res[4].value;
  if(!sameNickname && !sameUserNum){
    try{
      return await User.create(userData);
    }catch(e){
      console.error(e);
    }
  }
  
  if((!sameNickname && sameUserNum) || (sameNickname.userNum === sameUserNum.userNum)){
    try{
      return await User.update(sameUserNum, userData);
    }catch(e){
      console.error(e);
    }
  }
  
  if(sameNickname.userNum !== sameUserNum.userNum){
    try{
      User.changeNickname(sameNickname, '');
      return await User.update(sameUserNum, userData);
    }catch(e){
      console.error(e);
    }
  }
  
  return userData;
};

exports.getUserSeason = async (userNum, seasonId) => {
  let db = false, res;
  try{
    res = await Promise.allSettled([
      mongo.connect(),
      er.getUserSeason(userNum, seasonId)
    ]);
    if(res[0].status === 'fulfilled') db = true;
    else console.log('DB connection Error');
    if(res[1].status !== 'fulfilled') return { 'code': 500 };
  }catch(e){
    console.error(e);
  }
  
  const seasonData = {
    userRank: res[1].value.userRank,
    userStats: res[1].value.userStats
  };
  
  if(!db) return seasonData;
  try{
    const user = await User.findByUserNum(userNum);
    await User.update(user, seasonData);
  }catch(e){
    console.error(e);
  }
  
  return seasonData;
};

exports.getRoute = async (routeId) => {
  let db = false, res;
  try{
    res = await Promise.allSettled([
      mongo.connect(),
      er.getRoute(routeId)
    ]);
    if(res[0].status === 'fulfilled') db = true;
    else console.log('DB connection Error');
    if(res[1].status !== 'fulfilled') return { 'code': 500 };
  }catch(e){
    console.error(e);
  }
  if(res[1].value.code !== 200) return { 'code': 404 }
  const routeData = {
    ...res[1].value.result.recommendWeaponRoute,
    ...res[1].value.result.recommendWeaponRouteDesc
  };
  // console.log(JSON.stringify(routeData, 0, 2));
  
  if(!db) return routeData;
  try{
    const route = await Route.findByRouteId(routeId);
    if(route){
      return await Route.update(route, routeData);
    }else{
      return await Route.create(routeData);
    }
  }catch(e){
    console.error(e);
  }
  
  return routeData;
};

exports.getGame = async (gameId) => {
  let db = false, res;
  try{
    res = await Promise.allSettled([
      mongo.connect(),
      er.getGame(gameId)
    ]);
    if(res[0].status === 'fulfilled') db = true;
    else console.log('DB connection Error');
    if(res[1].status !== 'fulfilled') return { 'code': 500 };
  }catch(e){
    console.error(e);
  }
  if(res[1].value.code !== 200) return { 'code': 404 };
  const playdata = [...res[1].value.userGames];
  const gameData = {
    gameId: playdata[0].gameId,
    seasonId: playdata[0].seasonId,
    matchingMode: playdata[0].matchingMode,
    matchingTeamMode: playdata[0].matchingTeamMode,
    versionMajor: playdata[0].versionMajor,
    versionMinor: playdata[0].versionMinor,
    serverName: playdata[0].serverName,
    startDtm: playdata[0].startDtm,
    botAdded: playdata[0].botAdded,
    botRemain: playdata[0].botRemain,
    restrictedAreaAccelerated: playdata[0].restrictedAreaAccelerated,
    safeAreas: playdata[0].safeAreas,
    preMade: playdata[0].preMade,
    mmrAvg: playdata[0].mmrAvg,
    playdata: playdata
  };
  // console.log(JSON.stringify(gameData, 0, 2));
  
  if(!db) return gameData;
  try{
    const game = await Game.findByGameId(gameId);
    if(game){
      return await Game.update(game, gameData);
    }else{
      return await Game.create(gameData);
    }
  }catch(e){
    console.error(e);
  }
  
  return gameData;
};
