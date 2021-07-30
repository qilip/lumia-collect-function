const mongo = require('../connectdb.js');
const er = require('./er.js');
const User = require('../models/user.js');

exports.getUserInfo = async (nickname, seasonId) => {
  let db, userData;
  try{
    const results = await Promise.allSettled([
      mongo.connect(),
      er.getUserInfo(nickname, seasonId)
    ]);
    if(results[0].status === 'fulfilled') db = results[0].value;
    else console.log('DB connection Error');
    if(results[1].status === 'fulfilled') userData = results[1].value;
    else return { 'code' : 500 };
  }catch(e){
    console.error(e);
  }
  
  // await User.newUser(userData);
  
  return userData;
};
