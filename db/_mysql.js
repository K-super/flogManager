const mysql = require('mysql');
const MYSQL_CONF = require('../config/mysql_config')
var connection = mysql.createConnection({
  host: MYSQL_CONF.host,
  user: MYSQL_CONF.user,
  password: MYSQL_CONF.password,
  database: MYSQL_CONF.database,
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  };
  console.log('mysql connected as id ' + connection.threadId);
});


async function query(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results)
      }
    });
  })
}
async function end() {
  return new Promise((resolve, reject) => {
    connection.end(err => {
      reject("数据库--连接池关闭失败：" + err)
    });
    resolve("数据库--连接池已关闭！");
  })
}

// 设置新需求，若长时间未有请求，则连接池关闭
async function shutdown(timeout) {

}



// connection.end();
module.exports = {
  connection,
  query,
  end
}


