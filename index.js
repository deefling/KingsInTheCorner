const express = require('express')
var cors = require('cors')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY
const cards_dir = process.env.CARDS_DIRECTORY
const sql = require('./assets/drivers/mySQLDriver');
const bcrypt = require('bcrypt');
const activeTokens = [];

// server.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', ['origin', 'Content-Type', 'x-api-key', 'Accept']);
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     apiLog(req.url)
//     next();
// });

server.use(cors())



server.use(express.json());






server.get('/login', (req, res) => {
  res.sendFile(path.join(pages_dir, '/login.html'));
})

server.post('/checkPassword', async (req, res) => {
    const id = await sql.checkPassword(req.body.username, req.body.password)
    if(id !== -1){
      // var token = await generateToken(req.ip, id);      

      //put token in db by passing id
      res.json({validUser: true, token: "token"});

    } else {
      res.json({validUser: false});
    }

  });



server.get('/lobby', (req, res) => {
    res.sendFile(path.join(pages_dir, '/lobby.html'));
  })

server.get('/playerList', (req, res) => {
    var data = [
      {username: 'player1'},
      {username: 'player2'},
      {username: 'player3'},
      {username: 'player4'},
      {username: 'player5'},
    ]
    res.sendFile(path.join(pages_dir, '/lobby.html'));
  })




  server.get('/game', (req, res) => {
    res.sendFile(path.join(pages_dir, '/game.html'));
  
  })

  server.get('/cards', (req, res) => {
    res.sendFile(path.join(cards_dir, '/cards.json'));
  })



server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

function apiLog(msg){
  console.log('\x1b[95m[Server]:\x1b[0m', msg)
}

async function generateToken(ip = "127.0.0.1", id){

  var tokenstr = ""

  //timestamp to base 13
  var timestamp = Date.now()
  var cryptTime = timestamp.toString(16)

  //id chunks to base 10
  var cryptID = id.toString(8)

  var ipChunks = ip.split('.')
  var cleanIP = ip.replace(/\./g, '')
  var cleanIP = cleanIP.replace(/\:/g, '')
  cryptIP = cleanIP.toString(32)

  //get length of longest str
  var longestStr = cryptTime.length
  if (cryptID.length>longestStr){longestStr = cryptID.length}
  if (cryptTime.length>longestStr){longestStr = cryptTime.length}

  //normalize with zeroes
  cryptID = cryptID.padStart(longestStr, "0")
  cryptIP = cryptIP.padStart(longestStr, "0")
  cryptTime = cryptTime.padStart(longestStr, "0")

  var randChars = ""
  for(let i = 0; i < longestStr; i++){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    randChars += characters.charAt(Math.floor(Math.random() * characters.length));
     
  }

  //interleave characters
  for(let i = 0; i < longestStr; i++){
    tokenstr += randChars[i];
    tokenstr += cryptTime[i];
    //id in reverse order
    tokenstr += cryptID[longestStr - 1 - i]
    tokenstr += cryptIP[i]
  }


 //generate 60-char checksum using bcrypt + add to token
 let myPromise = new Promise((myResolve, myReject) => {
    bcrypt.genSalt(1,  function(err, salt) {
      if(err){myReject()}
      bcrypt.hash(tokenstr, salt, function(err, hash) {
        if(err){myReject()}
        var checksumtoken = hash + tokenstr
        myResolve(checksumtoken)
      });
    });
  });


  await myPromise.then(
    function(value) {tokenstr = value},
    function(error) {}
  );
  
  apiLog(tokenstr)
  activeTokens.push(tokenstr)
  return tokenstr

}

function verifyToken(){

}

function getDataFromToken(){}