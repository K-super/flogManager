const redis = require('../db/_redis')


// session认证 检测有无session
async function auth_session(ctx, next, info){
  let session_id ='wm:sess:'+ctx.cookies.get('wm.sid') //获取cookie值  --sessionid
  if (session_id !== undefined) {
    redis.get(session_id).then((session_val) => {
      
      ctx.body = {
        code:1,
        msg:"操作成功",
        data:session_val.data
      }
      return true;
    }).catch((err) => {
      return {err}
    })
  }
  return false;
}
exports.auth_session = auth_session
exports.auth_session_set = async function (ctx, next, info) {
  auth_session(ctx, next, info).then((res) => {
    if (!res) ctx.session.data = info;
  }).catch((err) => {
    return {err}
  })
  await next();
}

