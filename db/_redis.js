/**
 * redis的方法get和set
*/
const redis = require('redis')
const { REDIS_CONF } = require('../config/redis_config')

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', err => {
  console.error('redis error', err)
})

/**
 * redis set
 * @param {string} key 键
 * @param {string} val 值
 * @param {number} timeout 过期时间，单位 s
 */
async function set(key, val, timeout = 60 * 60) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val)
  redisClient.expire(key, timeout)
}
/**
 * redis set
 * @param {string} key 键
 */
async function del(key) {
   redisClient.del(key);
}

/**
 * redis get
 * @param {string} key 键
 */
async function get(key) {
  const promise = new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      try {
        resolve(
          JSON.parse(val)
        )
      } catch (err) {
        reject(err)
      }
    })
  })
  return promise
}


module.exports = {
  set,
  get,
  del
}

