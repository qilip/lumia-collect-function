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
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    console.log('getUserNum Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserRank = async (userNum, seasonId) => {
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`)
    ]);
    return res.map(
      (res) => {
        if(res.status === 'fulfilled'){
          console.log('getUserRank Response Time:' + res.value.duration);
          return res.value.data;
        }else{
          console.log('getUserRank Response Time:' + res.reason.duration);
          return { 'code': 500 }; // TODO: 잘 처리하기
        }
      }
    );
  }catch(e){
    console.error(e);
  }
};

exports.getUserStats = async (userNum, seasonId) => {
  try{
    const res = await er.get(`user/stats/${userNum}/${seasonId}`);
    console.log('getUserStats Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserGames = async (userNum, next) => {
  try{
    let res;
    if(next){
      res = await er.get('/user/games/' + userNum, { params: next });
    }else{
      res = await er.get('/user/games/' + userNum);
    }
    console.log('getUserGames Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getGame = async (gameId) => {
  try{
    const res = await er.get('/games/' + gameId);
    console.log('getGame Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getRoute = async (routeId) => {
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    console.log('getRoute Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};


exports.getUserInfo = async (nickname, seasonId) => {
  let userNum;
  try{
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    console.log('getUserNum Response Time: ' + res.duration);
    if(res.data.code === 404) return { 'code': 404 }; // TODO: 제대로 처리하기
    userNum = res.data.user.userNum;
    console.log(nickname + ' : ' + userNum);
  }catch(e){
    console.error(e);
  }
  
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`),
	    er.get(`user/stats/${userNum}/${seasonId}`)
    ]);
    const data = res.map(
      (res) => {
        if(res.status === 'fulfilled'){
          console.log('getUserInfo Response Time:' + res.value.duration);
          return res.value.data;
        }else{
          console.log('getUserInfo Response Time:' + res.reason.duration);
          console.log(res.reason);
          return { 'code': 500 }; // TODO: 잘 처리하기
        }
      }
    );
    const userRank = [ data[0], data[1], data[2] ];
    const userStats = data[3];
    return { userNum, nickname, userRank, userStats };
  }catch(e){
    console.error(e);
  }
};
