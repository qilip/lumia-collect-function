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
  if(!nickname) return { 'code' : 400 };
  try{
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    console.log('getUserNum Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserRank = async (userNum, seasonId) => {
  if(!userNum || seasonId === undefined) return { 'code' : 400 };
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
  if(!userNum || seasonId === undefined) return { 'code' : 400 };
  try{
    const res = await er.get(`user/stats/${userNum}/${seasonId}`);
    console.log('getUserStats Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getUserGames = async (userNum, start) => {
  if(!userNum) return { 'code' : 400 };
  try{
    let res;
    if(start){
      res = await er.get('/user/games/' + userNum, { params: { next: start } });
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
  if(!gameId) return { 'code' : 400 };
  try{
    const res = await er.get('/games/' + gameId);
    console.log('getGame Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};

exports.getRoute = async (routeId) => {
  if(!routeId) return { 'code' : 400 };
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    console.log('getRoute Response Time: ' + res.duration);
    return res.data;
  }catch(e){
    console.error(e);
  }
};


exports.getUserRecentGames = async (userNum, start, limit) => {
  if(!userNum || !limit) return { 'code' : 400 };
  try{
    let games = [];
    let next = start;
    let i = 0;
    while(games.length < limit && next !== -1 && i < limit){
      let res;
      if(next){
        res = await er.get('/user/games/' + userNum, { params: { next } });
      }else{
        res = await er.get('/user/games/' + userNum);
      }
      console.log('getUserGames[' + (i/10) + '] Response Time: ' + res.duration);
      games.push(...res.data.userGames);
      next = res.data.next || -1;
      i += 10;
    }
    
    return games;
  }catch(e){
    console.error(e);
  }  
};

exports.getUserSeason = async (userNum, seasonId) => {
  if(!userNum || seasonId === undefined) return { 'code' : 400 };
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
          console.log('getUserSeason[' + idx + '] Response Time:' + res.reason.duration);
          console.log(res.reason);
          return { 'code': 500 }; // TODO: 잘 처리하기
        }
      }
    );
    const rankData = data.slice(0, 3).map(
      (data, idx) => {
        return {
          seasonId,
          matchingTeamMode: idx+1,
          mmr: data.userRank.mmr,
          rank: data.userRank.rank,
        };
      }
    );
    const userRank = [ ...rankData ];
    const userStats = data[3].userStats || [];
    return { userRank, userStats };
  }catch(e){
    console.error(e);
  }
};
