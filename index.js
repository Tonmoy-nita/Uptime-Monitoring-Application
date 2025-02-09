//Title :Uptime Monitoring Application
//Description : A RESTFul API to monitoring up or down time of user definedlinks


const http = require('http')
const dotenv = require('dotenv');
const {handleReqRes} =require('./helpers/handleReqRes.js')
const enviornment =require('./helpers/enviornment.js')
const data=require('./lib/data.js')

// Load environment variables//.env config


const app={}

data.create("Tonmoy","tonu",{name : 'Tonmoy', message : 'I love my mother'},(err)=>{
    console.log(err);
})

app.createServer =()=>{
    const server=http.createServer(app.handleReqRes) 
    server.listen(enviornment.port,()=>{
        console.log(`Environment variable is ${enviornment.envName}`)
        console.log(`listening to port ${enviornment.port}`)
    })
}

app.handleReqRes = handleReqRes;
app.createServer();