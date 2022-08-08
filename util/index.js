
const crypto = require('crypto');

exports.md5 =  function (pwd){
  
  let md5 = crypto.createHash("md5");
  let newPas = md5.update(pwd).digest("hex");
  return newPas;
}






