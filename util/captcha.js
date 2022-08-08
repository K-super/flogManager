const svgCaptcha = require('svg-captcha');

async function getCaptcha(ctx) {
    //  若创建算数式验证码，将create改为createMathExpr
    const newCaptcha = svgCaptcha.create({
        size: 4, //验证码长度
        fontSize: 45, //验证码字号
        noise: Math.floor(Math.random() * 8), //干扰线条数目_随机0-5条
        width: 100, //宽度
        height: 30, //高度
        color: true, //验证码字符是否有颜色，默认是没有，但是如果设置了背景颜色，那么默认就是有字符颜色
        background: '#ccc' //背景色
    })
    // 验证码svg转换为文字内容
    // console.log("验证码："+newCaptcha.text.toLowerCase());
    return {
        svg: newCaptcha.data,
        value : newCaptcha.text.toLowerCase()
    }
}

module.exports = {
    getCaptcha
}
