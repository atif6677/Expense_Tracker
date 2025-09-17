
require('dotenv').config();
const { Sequelize } = require('sequelize');


const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
});


(async ()=>{
    try{
        await db.authenticate();
        console.log("Connection has been established sucessfully.");
    }
    catch(err){
        console.log("Unable to connect to the database",err);
    }
})();


module.exports = db
            