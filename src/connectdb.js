const mongoose = require('mongoose');

let conn = null;

exports.connect = async () => {
  if(conn == null){
    conn = mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);
    await conn;
  }
  return conn;
};
