const express = require('express')
var cors = require('cors')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY
const cards_dir = process.env.CARDS_DIRECTORY
const sql = require('./assets/drivers/mySQLDriver');
const { time } = require('console');
const activeTokens = [];

server.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', ['origin', 'Content-Type', 'x-api-key', 'Accept']);
    res.setHeader('Access-Control-Allow-Credentials', true);
    apiLog(req.url)
    next();
});

server.use(express.json());






server.get('/login', (req, res) => {
  res.sendFile(path.join(pages_dir, '/login.html'));
})

server.post('/checkPassword', async (req, res) => {
    //get checkuser to return an ID
    const id = await sql.checkPassword(req.body.username, req.body.password)
    if(id !== -1){
      var token = generateToken(req.ip, id);      

      //put token in db by passing id
      res.json({validUser: true, token: token});

    } else {
      res.json({validUser: false});
    }

  });

server.get('/lobby', (req, res) => {
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

function generateToken(ip = "127.0.0.1", id){

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

  //create simple checksum
  let checksum = 0;
  for (let i = 0; i < tokenstr.length; i++) {
    // Add the ASCII value to checksum
    checksum += tokenstr.charCodeAt(i);
  }
 
  // Ensure the checksum is within the range of 0-255 with leading zeros
  checksum = (checksum % 256).toString().padStart(3, "0");

  tokenstr += checksum

  apiLog(randChars)
  apiLog(cryptID)
  apiLog(cryptIP)
  apiLog(cryptTime)
  apiLog(tokenstr)


  activeTokens.push(tokenstr)
  return tokenstr

}

function verifyToken(){

}

function getDataFromToken(){}