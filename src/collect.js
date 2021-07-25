const mongoose = require('mongoose');

const er = require('./er.js');

let conn = null;

module.exports.handler = async (event, ctx) => {
  // connect mongodb
  ctx.callBackWaitsForEmptyEventLoop = false;
  if(conn == null){
    conn = mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);
    await conn;
  }
  return { 'statusCode': 200, 'body': JSON.stringify(await er.getUserNum('화이트모카')) };
};
