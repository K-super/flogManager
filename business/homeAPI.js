const captcha  = require('../middleware/captcha')
const redis = require('../db/_redis')
const auth = require('../middleware/auth')

/**
 * 
 * @api {POST} /captcha 验证码获取
 * @apiName captcha
 * @apiVersion  1.0.0
 * 
 * 
 * @apiSuccessExample {Object} 响应示例:
 HTTP/1.1 200 OK
 {
   code: 1,
   msg: "操作成功",
 }
 */
async function captchaV (ctx,next){
  try {
    const cap_svg = await captcha.getCaptcha();
    if(cap_svg.value) {
      ctx.body = {data:cap_svg.svg};
      redis.set(cap_svg.value,cap_svg.svg,60);   //实效60s
    }
    return {
      code:1,
      msg: "操作成功"
    }
  } catch (error) {
    return { data:error};
  }
}
exports.captchaV = captchaV;
/**
 * @api {POST} /signin 用户登录
 * @apiName signin
 * @apiVersion  1.0.0
 * @apiParam  {String} userName 登录名或工号
 * @apiParam  {String} password 密码
 * @apiParam  {String} userVerificationCode 验证码
 * @apiParamExample  {Object} 请求示例:
 {
   userName : admin,
   password : 12345,
   userVerificationCode : 12ab
 }
 *
 * @apiSuccessExample {Object} 响应示例:
 HTTP/1.1 200 OK
 {
   errcode: 0,
   errmsg: "操作成功",
   retobj: {"userName":"admin"}
 }
 *
 */
exports.signin = async function (ctx ,next){
  const userinfo = {
    username:ctx.request.body.username,
    userpwd:ctx.request.body.userpwd,
    userVerificationCode:ctx.request.body.userVerificationCode
  }
  // 判断验证码
  redis.get(userinfo.userVerificationCode).then((res) => {
    if(!res) {
      ctx.body = {code:0,msg:"验证码错误"} ;
      // captchaV() //重制验证码
    }
  }).catch((err) => {
    return {err}
  })
  // session身份识别
  auth.auth_session_set(ctx,next,userinfo)
  // 若第一次登陆则设置session，存储mysql

  ctx.body = { errno: 0, message: '登陆成功', data:{username:userinfo.username} }
}

/**
 * @api {POST} /session_search 查找session判断登陆状态
 * @apiName session_search
 * @apiVersion  1.0.0
 * @apiSuccessExample {Object} 响应示例:
 HTTP/1.1 200 OK
 {
   code: 0,
   msg: "操作成功",
   data: {"userName":"admin"}
 }
 *
 */

exports.session_search = async function (ctx ,next){
  auth.auth_session(ctx ,next).then((data)=>{
    // console.log(data);
  })
}

