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
router.get('/session_search',homeAPI.session_search)
router.post('/signin',async (ctx,next) => {
  homeAPI.signin(ctx,next);
})
router.post('/register',async (ctx,next) => {
  ctx.body = {
    date:ctx.request.body
  }
})

module.exports = router
