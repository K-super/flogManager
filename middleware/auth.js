const _redis = require('../db/_redis')


// session认证 检测有无session
async function auth_session(ctx, next){
  return new Promise((resolve,reject)=>{
    if (ctx.cookies.get('wm.sid') !== undefined) {
      let session_id = 'wm:sess:'+ctx.cookies.get('wm.sid') //获取cookie值  --sessionid
      _redis.get(session_id).then((session_val) => {
        resolve({
          code:1,
          msg:"操作成功",
          data:session_val.data
        });
      })
    }else reject(false);
  }).catch(err=>{
    console.log(err);
  })
}
exports.auth_session = auth_session;
exports.auth_session_set = async function (ctx, next, info) {
  auth_session(ctx, next).then((res) => {
    if (!res) ctx.session.data = info;
  }).catch((err) => {
    return {err}
  })
  await next();
}

