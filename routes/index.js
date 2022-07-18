const router = require('koa-router')();
const captchaAPI = require('../api/captcha')
 

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})
// 验证码路由
router.get('/captcha', captchaAPI.getCaptcha)
router.post('/signin',async (ctx,next) => {
  data = {
    res:"success",
    user:ctx.request.body.username
  }
  ctx.body = data;
})
router.post('/register',async (ctx,next) => {
  ctx.body = {
    date:ctx.request.body
  }
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
