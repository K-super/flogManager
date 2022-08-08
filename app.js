const Koa = require('koa')
const cors = require('koa2-cors');
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const index = require('./controllers/index')
const {REDIS_CONF} = require('./config/redis_config')
const {target} = require('./config/index')
const session = require('koa-generic-session')
// 使用redis做内存数据库，访问更快
const redisStore = require('koa-redis')




// 配置session中间件
app.keys = ['IOdhakw23792#'] // session 密钥
app.use(session({
    key: 'wm.sid', // cookie name 默认是 `koa.sid`
    prefix: 'wm:sess:', // redis key 的前缀，默认是 `koa:sess:`
    rolling: true, /** 是否每次响应时刷新Session的有效期。(默认是 false) */
    httpOnly: true, //是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true)
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 单位 ms
    },
    store: redisStore({
        all: REDIS_CONF.host+REDIS_CONF.port
    })
}))
// error handler
onerror(app)
app.use(cors({
  origin: target,    // 测试前端地址 
  credentials: true //解决可携带cookie
}));
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
// app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});




module.exports = app
