const sql = require('./mySQLDriver.js');


recreateDB();
setTimeout(()=>checkDB(), 5000)
