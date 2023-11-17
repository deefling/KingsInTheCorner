//setup basic service of html pages?

const express = require('express')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY



server.get('/login', (req, res) => {
  res.sendFile(path.join(pages_dir, '/login.html'));

})

server.get('/lobby', (req, res) => {
    res.sendFile(path.join(pages_dir, '/lobby.html'));
  
  })



server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})