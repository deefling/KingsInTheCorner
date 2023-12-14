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

    //DROP LOBBY TABLE
    con.query("DROP TABLE IF EXISTS lobby", function (err, result) {
      if (err) throw err;
      dbLog("Table dropped");
  });
    
    //DROP USER TABLE
    con.query("DROP TABLE IF EXISTS users", function (err, result) {
        if (err) throw err;
        dbLog("Table dropped");
    });
      
    //CREATE TABLE FOR USERS
    //TODO add session token & login time?
    var sql = 'CREATE TABLE users (userID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, sessionToken VARCHAR(255))';
    con.query(sql, function (err, result) {
      if (err) throw err;
      dbLog("Table created");
      
      //INSERT SAMPLE USER
      addUser('deefling', 'password')
    });

    //CREATE TABLE FOR LOBBY
    sql = "CREATE TABLE lobby (userID INT, FOREIGN KEY (userID) REFERENCES USERS(userID))"
    con.query(sql, function (err, result) {
      if (err) throw err;
      dbLog("Table created");
    });

    setTimeout(()=>con.release(), 5000)



  });
}

function checkDB(){
  pool.getConnection(function(err, con) {
    if (err) throw err;

    var sql = 'SELECT * FROM users';
    con.query(sql, function (err, result) {
      if (err) throw err;
      dbLog(result);
    });

    var sql = 'SELECT * FROM lobby';
    con.query(sql, function (err, result) {
      if (err) throw err;
      dbLog(result);
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



async function checkPassword(user, pw){
  var valid = false;
  var id = -1;
  
  let myPromise = new Promise((myResolve, myReject) => {
  pool.getConnection(function(err, con) {
    if (err) throw err;

    const password = sha256(pw)
  
    var sql = "SELECT userID FROM users WHERE username = ? AND password = ?;"
    
    con.query(sql, [user, password], (err, result) => {
      con.release();

      if (err) throw err;

      if(result.length == 0){
        dbLog('Matching user & password not found');
        myReject();
        return;
      }

      dbLog("User password confirmed");
      myResolve(result[0].userID)
      return
    });

  })
})

await myPromise.then(
  function(value) {id = value},
  function(error) {}
);

  return id;
}

function setToken(userID, token){

}

function getToken(userID){

}

function joinLobby(token){
  
}

function leaveLobby (token){
  
}

function dbLog(msg){
  console.log('\x1b[34m[MySQL]:\x1b[0m', msg)
}





module.exports = { checkPassword, dbLog, checkDB, recreateDB}