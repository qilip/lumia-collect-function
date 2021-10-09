const er = require('./api/er.js');
// const ctrl = require('./api/ctrl.js');

const funcMapper = {
  getUserNum: p => er.getUserNum(p.nickname),
  getUserRank: p => er.getUserRank(p.userNum, p.seasonId),
  getUserStats: p => er.getUserStats(p.userNum, p.seasonId),
  getUserGames: p => er.getUserGames(p.userNum, p.start),
  getGame: p => er.getGame(p.gameId),
  getRoute: p => er.getRoute(p.routeId),
  getUserRecentGames: p => er.getUserRecentGames(p.userNum, p.start, p.limit),
  getUserSeason: p => er.getUserSeason(p.userNum, p.seasonId),
  // getUserInfo: p => ctrl.getUserInfo(p.nickname, p.seasonId)
};

module.exports.handler = async (event, ctx) => {
  ctx.callBackWaitsForEmptyEventLoop = false;
  
  if(!event.query || !event.param)
    return { 'statusCode': 400, 'message': 'Missing query' };
  if(!funcMapper.hasOwnProperty(event.query))
    return { 'statusCode': 400, 'message': 'Bad query' };
  if(process.env.STAGE === 'dev') console.log(event);

  try{
    const res = await funcMapper[event.query](event.param);
    return {
      'statusCode': res.statusCode || 200,
      'erCode': res.erCode,
      'message': res.message || 'Success',
      'data': res.data
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};
