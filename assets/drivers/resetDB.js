const sql = require('./mySQLDriver.js');


sql.recreateDB();
setTimeout(()=>sql.checkDB(), 5000)
