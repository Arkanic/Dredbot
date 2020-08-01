let s = 1000;
let m = 60;
let h = 60;
let d = 24;

module.exports = Object.freeze({
  CACHE_REFRESH_LEADERBOARD: s*m*h*3,
  CACHE_REFRESH_PLAYERS: s*m/2,
  CACHE_REFRESH_MONGODB: s*m*h*d,
  BOT_REFRESH_PRESENCE: s*5
})