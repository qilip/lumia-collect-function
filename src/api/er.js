const axios = require('axios');

const er = axios.create({
  baseURL: 'https://open-api.bser.io/v1',
  timeout: 4000,
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
  if(!nickname) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    console.log('getUserNum Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'user': res.data.user }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};

exports.getUserRank = async (userNum, seasonId) => {
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`)
    ]);
    const data = res.map(
      (res, idx) => {
        if(res.status === 'fulfilled'){
          console.log('getUserRank[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data;
        }else{
          console.log('getUserRank[' + idx + '] Fail Response Time:' + res.reason.duration);
          return { 'code': 500, 'message': 'axios request fail' };
        }
      }
    );
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        'solo': data[0],
        'duo': data[1],
        'squad': data[2]
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};

exports.getUserStats = async (userNum, seasonId) => {
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get(`user/stats/${userNum}/${seasonId}`);
    console.log('getUserStats Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'userStats': res.data.userStats }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};

exports.getUserGames = async (userNum, start) => {
  if(!userNum) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    let res;
    if(start){
      res = await er.get('/user/games/' + userNum, { params: { next: start } });
    }else{
      res = await er.get('/user/games/' + userNum);
    }
    console.log('getUserGames Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'games': res.data.userGames }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};

exports.getGame = async (gameId) => {
  if(!gameId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/games/' + gameId);
    console.log('getGame Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'games': res.data.userGames }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};

exports.getRoute = async (routeId) => {
  if(!routeId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    console.log('getRoute Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,      
      'data': { 'route': res.data.result }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};


exports.getUserRecentGames = async (userNum, start, limit) => {
  if(!userNum || !limit) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    let games = [];
    let next = start;
    let i = 0;
    let res;
    while(games.length < limit && next !== -1 && i < limit){
      if(next){
        res = await er.get('/user/games/' + userNum, { params: { next } });
      }else{
        res = await er.get('/user/games/' + userNum);
      }
      console.log('getUserGames[' + (i/10) + '] Response Time: ' + res.duration);
      if(res.data.code !== 200) return { 'erCode': res.data.code, 'message': res.data.message };
      games.push(...res.data.userGames);
      next = res.data.next || -1;
      i += 10;
    }
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'games': res.data.userGames }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }  
};

exports.getUserSeason = async (userNum, seasonId) => {
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`),
	    er.get(`user/stats/${userNum}/${seasonId}`)
    ]);
    const data = res.map(
      (res, idx) => {
        if(res.status === 'fulfilled'){
          console.log('getUserSeason[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data;
        }else{
          console.log('getUserSeason[' + idx + '] Fail Response Time:' + res.reason.duration);
          return { 'code': 500, 'message': 'axios request fail' };
        }
      }
    );
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        'solo': data[0],
        'duo': data[1],
        'squad': data[2],
        'userStats': data[3]
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
};
