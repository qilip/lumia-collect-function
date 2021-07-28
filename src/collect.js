const mongo = require('./connectdb.js');
const er = require('./er.js');

const funcMapper = {
  getUserNum: p => er.getUserNum(p.nickname),
  getUserRank: p => er.getUserRank(p.userNum, p.seasonId),
  getUserStats: p => er.getUserStats(p.userNum, p.seasonId),
  getUserGames: p => er.getUserGames(p.userNum),
  getGame: p => er.getGame(p.gameId),
  getRoute: p => er.getRoute(p.gameId)
};

module.exports.handler = async (event, ctx) => {
  ctx.callBackWaitsForEmptyEventLoop = false;
  
  // connect mongodb
  await mongo.connect();

  if(!event) return { 'statusCode': 400, 'body': 'Missing query' };
  console.log(event);
  if(!funcMapper.hasOwnProperty(event.query))
    return { 'statusCode': 400, 'body': 'Bad query' };

  try{
    const res = await funcMapper[event.query](event.param);
    return { 'statusCode': 200, 'body': res };
  }catch(e){
    ctx.captureError(e);
  }
};
