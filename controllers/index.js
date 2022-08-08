const router = require('koa-router')();
const homeAPI = require('../business/homeAPI');
const cookie = require('../db/_redis');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})
// 验证码路由
router.get('/captcha',homeAPI.captchaV)
// 首次登陆获取session
router.get('/session_search',async (ctx,next)=>{
  await homeAPI.session_search(ctx,next);
})
// 登陆
router.post('/signin',async (ctx,next) => {
  await homeAPI.signin(ctx,next);
})
// 注册
router.post('/register',async (ctx,next) => {
  await homeAPI.register(ctx,next);
})
// 退出登录
router.get('/logOut',async (ctx,next) => {
  await homeAPI.logOut(ctx,next)
})

module.exports = router
