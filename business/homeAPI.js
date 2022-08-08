const captcha = require('../util/captcha')
const _redis = require('../db/_redis')
const _mysql = require('../db/_mysql')
const auth = require('../middleware/auth')
const util_md5 = require('../util/index')
// const util_index = require('../util/index') 

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
async function captchaV(ctx, next) {
  try {
    const cap_svg = await captcha.getCaptcha();
    if (cap_svg.value) {
      ctx.body = { data: cap_svg.svg };
      _redis.set(cap_svg.value, cap_svg.svg, 60);   //实效60s
    }
    return {
      code: 1,
      msg: "操作成功"
    }
  } catch (error) {
    return { data: error };
  }
}
exports.captchaV = captchaV;
/**
 * @api {POST} /signin 用户登录
 * @apiName signin
 * @apiVersion  1.0.0
 * @apiParam  {String} username 用户名
 * @apiParam  {String} userpwd 密码
 * @apiParam  {String} userVerificationCode 验证码
 * @apiParamExample  {Object} 请求示例:
 {
   username : admin,
   userpwd : 12345,
   userVerificationCode : 12ab
 }
 *
 * @apiSuccessExample {Object} 响应示例:
 HTTP/1.1 200 OK
 {
   code: 0,
   msg: "操作成功",
   data: {"userName":"admin"}
 }
 *
 */
exports.signin = async function (ctx, next) {
  try {
    const userinfo = {
      username: ctx.request.body.username,
      userpwd:  util_md5.md5(ctx.request.body.userpwd),
      userVerificationCode: ctx.request.body.userVerificationCode
    }
    // 判断验证码
    let captcha = await _redis.get(userinfo.userVerificationCode, 'string');
    if (!captcha) {
      ctx.body = { code: 0, msg: "验证码错误" }
      return;
    };
    // 如果没有cookie表示第一次登陆，获取mysql数据比对并设置session
    let sql = `select * from user where userpwd = '${userinfo.userpwd}' and username = '${userinfo.username}'`;
    let mysql_user = await _mysql.query(sql);
    mysql_user = mysql_user[0];
    // console.log(mysql_user[0]);
    if (!mysql_user) ctx.body = { code: 0, msg: '登陆失败--账号或密码错误' };
    else if (mysql_user.username == userinfo.username && mysql_user.userpwd == userinfo.userpwd) {
      auth.auth_session_set(ctx, next, mysql_user);
      ctx.body = { code: 1, msg: '登陆成功', data: { username: mysql_user.username } }
    }
  } catch (error) {
    console.log(error);
  }

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
exports.session_search = async function (ctx, next) {
  // session身份识别
  let session_val = await auth.auth_session(ctx, next);
  if (session_val) {
    // 如果有cookie则获取session值返回
    ctx.body = session_val;
    return;
  } else {
    ctx.body = { code: 0, msg: "当前用户不存在" };
    return;
  }
}

/**
 * @api {POST} /register 用户注册
 * @apiName  register
 * @apiVersion  1.0.0
 * @apiParam  {String} regUserName 用户名
 * @apiParam  {String} regUserPwd 密码
 * @apiParam  {String} confirmUserPwd 重复密码
 * @apiParam  {String} regUserVerificationCode 验证码
 * @apiParamExample  {Object} 请求示例:
 {
   regUserName : admin,
   regUserPwd : 12345,
   confirmUserPwd : 12345
   regUserVerificationCode : 12ab
 }
 *
 * @apiSuccessExample {Object} 响应示例:
 HTTP/1.1 200 OK
 {
   code: 0,
   msg: "操作成功",
   data: {"userName":"admin"}
 }
 *
 */
exports.register = async function (ctx, next) {
  try {
    const userinfo = {
      regUserName: ctx.request.body.regUserName,
      regUserPwd: util_md5.md5(ctx.request.body.regUserPwd),
      confirmUserPwd: ctx.request.body.confirmUserPwd,
      regUserVerificationCode: ctx.request.body.regUserVerificationCode
    }
    // 判断验证码
    let captcha = await _redis.get(userinfo.regUserVerificationCode, 'string');
    if (!captcha) {
      ctx.body = { code: 0, msg: "验证码错误" }
      return;
    };
    // 判断账户值是否惟一
    let sql = `select username from user where username = '${userinfo.regUserName}'`;
    let user_search = await _mysql.query(sql);
    user_search = user_search[0]; //选中第一条数据
    if (!user_search) {
      // 将数据存入数据库
      sql = `INSERT INTO user VALUES ('${userinfo.regUserName}','${userinfo.regUserPwd}');`
      let user_preserve = await _mysql.query(sql);
      if (user_preserve) ctx.body = { code: 0, msg: "操作成功" }
    } else ctx.body = { code: 0, msg: "操作失败，该用户名已存在" };
  } catch (error) {
    console.log(error);
  }
}
/**
 * 
 * @api {GET} /logOut 用户退出
 * @apiName logOut
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
exports.logOut = async function (ctx, next) {
  // 删除session
  ctx.session = null;
  ctx.body = {code:1,msg:"操作成功，session已清除"}
  // 
}
