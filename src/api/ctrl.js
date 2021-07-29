const mongo = require('../connectdb.js');
const er = require('./er.js');

exports.getUserInfo = async (nickname, seasonId) => {
  let db, userData;
  try{
    const results = await Promise.allSettled([
      mongo.connect(),
      erUserInfo(nickname, seasonId)
    ]);
    if(results[0].status === 'fulfilled') db = results[0].value;
    if(results[1].status === 'rejected');
  }catch(e){
    console.error(e);
  }
  return userData;
};
