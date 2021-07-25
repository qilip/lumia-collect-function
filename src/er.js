const axios = require('axios');
const mongoose = require('mongoose');

const er = axios.create({
  baseURL: 'https://open-api.bser.io/v1',
  timeout: 5000,
  headers: {
    'accept': 'application/json',
    'x-api-key': process.env.ER_KEY
  }
});

exports.getUserNum = async (nickname) => {
  try{
    const res = await er.get('/user/nickname', {
      params: {
        query: nickname
      }
    });
    return res.data;
  }catch(e){
    console.error(e);
  }
}

exports.getUserGames =async (userNum) => {
  try{
    const res = await er.get('/user/games/' + userNum);
    return res.data;
  }catch(e){
    console.error(e);
  }
}
