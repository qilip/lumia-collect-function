const er = require('./api/er.js');
const ctrl = require('./api/ctrl.js');

const funcMapper = {
  getUserNum: p => er.getUserNum(p.nickname),
  getUserRank: p => er.getUserRank(p.userNum, p.seasonId),
  getUserStats: p => er.getUserStats(p.userNum, p.seasonId),
  getUserGames: p => er.getUserGames(p.userNum, p.start),
  getGame: p => ctrl.getGame(p.gameId),
  getRoute: p => ctrl.getRoute(p.routeId),
  getUserRecentGames: p => er.getUserRecentGames(p.userNum, p.start, p.limit),
  getUserSeason: p => ctrl.getUserSeason(p.userNum, p.seasonId),
  getUserInfo: p => ctrl.getUserInfo(p.nickname, p.seasonId)
};

module.exports.handler = async (event, ctx) => {
  ctx.callBackWaitsForEmptyEventLoop = false;
  
  if(!event.query || !event.param)
    return { 'statusCode': 400, 'body': 'Missing query' };
  if(!funcMapper.hasOwnProperty(event.query))
    return { 'statusCode': 400, 'body': 'Bad query' };
  if(process.env.STAGE === 'dev') console.log(event);

  try{
    const res = await funcMapper[event.query](event.param);
    return { 'statusCode': 200, 'body': res };
  }catch(e){
    ctx.captureError(e);
  }
};
