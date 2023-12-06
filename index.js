const express = require('express')
var cors = require('cors')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY
const sql = require('./assets/drivers/mySQLDriver')

// server.use(cors({origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'null', '*']}))



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
    const valid = sql.checkUser(req.body.username, req.body.password)
    apiLog(valid)
    res.json({validUser: valid});
    // res.send(valid)
  });

server.get('/lobby', (req, res) => {
    res.sendFile(path.join(pages_dir, '/lobby.html'));
  
  })



server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

function apiLog(msg){
  console.log('\x1b[95m[Server]:\x1b[0m', msg)
}