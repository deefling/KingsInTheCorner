const express = require('express')
var cors = require('cors')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY
const cards_dir = process.env.CARDS_DIRECTORY
const sql = require('./assets/drivers/mySQLDriver')

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

server.post('/checkPassword', (req, res) => {
    //get checkuser to return an ID
    const valid = sql.checkUser(req.body.username, req.body.password)
    apiLog(valid)
    if(valid){
      //generate token here?
      apiLog(req.socket.remoteAddress)


      //put token in db by passing id
    }


    res.json({validUser: valid});
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