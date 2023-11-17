//setup basic service of html pages?

const express = require('express')
const server = express()
const port = 3000
const path = require('path');
const dotenv = require('dotenv').config()
const pages_dir = process.env.PAGES_DIRECTORY



server.get('/login', (req, res) => {
//   res.send('Hello World!')
  res.sendFile(path.join(pages_dir, '/login.html'));

})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})