//Title :Uptime Monitoring Application
//Description : A RESTFul API to monitoring up or down time of user definedlinks


const http = require('http')
const {handleReqRes} =require('./helpers/handleReqRes.js')

const app={}

app.config={
    port : 3000,
}

app.createServer =()=>{
    const server=http.createServer(app.handleReqRes) 
    server.listen(app.config.port,()=>{
        console.log(`listening to port ${app.config.port}`)
    })
}

app.handleReqRes = handleReqRes;
app.createServer();