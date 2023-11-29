var mysql = require('mysql');

//CREATE USER 'King'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Corner';
// GRANT ALL on *.* to 'King'@'localhost';
var con = mysql.createConnection({
    host: "localhost",
    user: "King",
    password: "Corner"
  });
  
  

function recreateDB(){
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    
        //USE DB
        con.query("CREATE DATABASE IF NOT EXISTS kingsinthecorner", function (err, result) {
            if (err) throw err;
            console.log("Database created/found");
        });
        
        //USE DB
        con.query("USE kingsinthecorner", function (err, result) {
            if (err) throw err;
            console.log("Database accessed");
        });
    
        //DROP USER TABLE
        con.query("DROP TABLE IF EXISTS users", function (err, result) {
            if (err) throw err;
            console.log("Table dropped");
        });
        
        //CREATE TABLE FOR USERS
        var sql = "CREATE TABLE users (username VARCHAR(255), password VARCHAR(255))";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Table created");
        });
      });
}

recreateDB()