const axios = require('axios');

const er = axios.create({
  baseURL: 'https://open-api.bser.io/v1',
  timeout: 3000,
  headers: {
    'accept': 'application/json',
    'x-api-key': process.env.ER_KEY
  }
});

er.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);

er.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date();
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
  }
);

exports.getUserNum = async (nickname) => {
  try{
    const res = await er.get('/user/nickname', {
      params: {
        query: nickname
      }
    });
    console.log('Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserRank = async (userNum, seasonId) => {
  try{
    const res = await Promise.all([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`)
    ]);
    console.log('Response Time:' + res.map(res => res.duration));
    return res.map((res) => res.data);
  }catch(e){
    console.error(e);
  }
};

exports.getUserStats = async (userNum, seasonId) => {
  try{
    const res = await er.get(`user/stats/${userNum}/${seasonId}`);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserGames = async (userNum) => {
  try{
    const res = await er.get('/user/games/' + userNum);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getGame = async (gameId) => {
  try{
    const res = await er.get('/games/' + gameId);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getRoute = async (routeId) => {
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    return res.data;
  }catch(e){
    console.error(e);
  }
};
