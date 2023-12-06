const mysql = require('mysql');
const {sha256} = require('js-sha256');

//CREATE USER 'King'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Corner';
// GRANT ALL on *.* to 'King'@'localhost';
var pool = mysql.createPool({
  connectionLimit : 10,
  host: "localhost",
  user: "King",
  password: "Corner",
  database: 'kingsinthecorner'
});


function recreateDB(){
  pool.getConnection(function(err, con) {
    if (err) throw err;
        
    //USE DB
    con.query("CREATE DATABASE IF NOT EXISTS kingsinthecorner", function (err, result) {
        if (err) throw err;
        dbLog("Database created/found");
    });
    
    //USE DB
    con.query("USE kingsinthecorner", function (err, result) {
        if (err) throw err;
        dbLog("Database accessed");
    });

    //DROP USER TABLE
    con.query("DROP TABLE IF EXISTS users", function (err, result) {
        if (err) throw err;
        dbLog("Table dropped");
    });
      
    //CREATE TABLE FOR USERS
    //TODO add session token & login time?
    var sql = "CREATE TABLE users (username VARCHAR(255), password VARCHAR(255))";
    con.query(sql, function (err, result) {
      if (err) throw err;
      dbLog("Table created");
      
      //INSERT SAMPLE USER
      addUser('deefling', 'password')
    });

    con.release()
  });
  
}

function addUser(user, pw) {
  pool.getConnection(function(err, con) {
    if (err) throw err;
    dbLog("Connected!");

    const password = sha256(pw)
    
    var sql = "INSERT INTO users (username, password) VALUES (?,?)";
        con.query(sql, [user, password], (err, result) => {
          if (err) throw err;
          dbLog("Record inserted!");
    });

    con.release()
  });
}

function checkUser(user, pw){
  var valid = false;
  
  pool.getConnection(function(err, con) {
    if (err) throw err;

    const password = sha256(pw)
  
    var sql = "SELECT username FROM users WHERE username = ? AND password = ?;"
    
    con.query(sql, [user, password], (err, result) => {
      if (err) throw err;

      if(result.length == 0){
        dbLog('Matching user & password not found');
        return;
      }

      dbLog("User password confirmed");
      valid = true
      return
    });

    con.release();
  });
  return valid;
}

function checkToken(user, token){

}

function dbLog(msg){
  console.log('\x1b[34m[MySQL]:\x1b[0m', msg)
}




// recreateDB();

module.exports = { checkUser, dbLog}