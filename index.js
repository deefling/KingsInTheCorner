const express = require('express')
var cors = require('cors')
const server = express()
const port = 3000
const path = require('path');
const pages_dir = path.join(__dirname, "/assets/pages/")
const cards_dir = path.join(__dirname, "/assets/cards/")
const sql = require('./assets/drivers/mySQLDriver');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const lobby = [];
const activeSessions = []


server.use(cors())
server.use(cookieParser());
server.use(express.json());
server.use(function(req, res, next){
  // apiLog(req.method + " " + req.url + " invoked")
  //validatetoken if not login page?
  next();
})



server.get('/login', (req, res) => {
  const {token} = req.cookies

  activeSessions.forEach((user, index) => {
    if(token == user.token){
      res.redirect('/lobby')
      return
    }
  })

  res.sendFile(path.join(pages_dir, '/login.html'));
})



server.get('/logout', (req, res) => {
  const {token} = req.cookies

  lobby.forEach((user, index) => {
    if(token == user.token){
      lobby.splice(index, 1)
      return;
    }
  })
  
  activeSessions.forEach((user, index) => {
    if(token == user.token){
      activeSessions.splice(index, 1)
    }
  })

  res.clearCookie('token')
  res.json({loggedOut: true})
})


server.post('/signUp', async (req, res) => {
  var id = await sql.addUser(req.body.username, req.body.password)

  if(id !== -1){
    var token = await generateToken(id, req.ip);

    activeSessions.push({username: req.body.username, token: token})
    sql.setToken(id, token)
    
    res.cookie('token', token);      
    res.json({validUser: true});

  } else {
    res.json({validUser: false});
  }
})


server.post('/checkPassword', async (req, res) => {
    const id = await sql.checkPassword(req.body.username, req.body.password)
    if(id !== -1){
      var token = await generateToken(id, req.ip);

      activeSessions.push({username: req.body.username, token: token})
      sql.setToken(id, token)
      
      res.cookie('token', token);      
      res.json({validUser: true});

    } else {
      res.json({validUser: false});
    }

  });



server.get('/lobby', (req, res) => {
  const {token} = req.cookies
  
  if(!token){
    res.redirect('/login');
    return
  }

  activeSessions.forEach((user) => {
    if(token == user.token){
      var notAlreadyInLobby = true
      lobby.forEach((row) => {
        if(token == row.token){
          notAlreadyInLobby = false;
          return;
        }
      });
      
      if(notAlreadyInLobby){
        lobby.push(user)
      }
      return;
    }
  })

  result = verifyToken(token, req.ip)

  res.sendFile(path.join(pages_dir, '/lobby.html'));
  })




  server.get('/leaveLobby', (req, res) => {
    const {token} = req.cookies
    
    if(!token){
      return
    }
  
    lobby.forEach((user, index) => {
      if(token == user.token){
        lobby.splice(index, 1)
        return;
      }
    })
    
    res.json({leftLobby: true});
    })
  
  




server.get('/playerList', (req, res) => {
  const {token} = req.cookies

    var data = [
      {username: 'player1'},
      {username: 'player2'},
      {username: 'player3'},
      {username: 'player4'},
      {username: 'player5'},
      {username: 'player6'},
      {username: 'player7'},
      {username: 'player8'},
      {username: 'player9'},
      {username: 'player10'},
    ];

    res.json(lobby);
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

async function generateToken(id, ip = "127.0.0.1"){

  var tokenstr = ""

  //timestamp to base 13
  var timestamp = Date.now()
  var cryptTime = timestamp.toString(12)

  //id chunks to base 10
  var cryptID = id.toString(8)


  var cleanIP = ip.replace(/\./g, '')
  var cleanIP = cleanIP.replace(/\:/g, '')
  cryptIP = parseInt(cleanIP, 16).toString()

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
  
  apiLog("Generated token:" + tokenstr)
  return tokenstr
}



async function decodeToken(token){
  var data = {validToken: false}

  var checksum = token.substring(0, 60)
  var interleavedToken = token.substring(60, token.length)

  //analyze checksum to make sure string has not been tampered with
  await bcrypt.compare(interleavedToken, checksum, (err, result)=>{
    if(err){return}

    //de-interleave all values
    var ip = ""
    var id = ""

    for(let i = 3; i < interleavedToken.length; i += 4){
      ip += interleavedToken[i]
    }

    for(let i = interleavedToken.length -2; i > 0; i -= 4){
      id += interleavedToken[i]
    }

    ip = ip.toString(16)
    while(ip.charAt[0] == '0'){
      ip = ip.substring(1, ip.length)
    }

    id = parseInt(id, 8)

    data.ip = ip;
    data.id = id;
    return
  })

return data
}

async function verifyToken(token, ip){
  var data = await decodeToken(token)
  //use promises to wait for data
  // apiLog(data)

  // var found = false
  // lobby.forEach((user) => {
  //   if(token == user.token){
  //     return
  //   }
  // })
}