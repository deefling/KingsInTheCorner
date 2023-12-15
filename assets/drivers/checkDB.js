const sql = require('./mySQLDriver.js');

async function main (){
    sql.checkDB()
    await sql.setToken(1, "testToken")
    sql.checkDB()
}

main()