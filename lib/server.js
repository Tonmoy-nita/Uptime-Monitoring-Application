//Title :Server Library
//Description : server related files



const http = require('http')
const enviornment =require('../helpers/enviornment.js')
const {handleReqRes} =require('../helpers/handleReqRes.js')


//server object - module scaffolding

const server={}

//configuration

server.config ={
    port:process.env.PORT || 3000,
}

//create server

server.createServer =()=>{
    const createServerVariable = http.createServer(server.handleReqRes) 
    createServerVariable.listen(server.config.port,()=>{
        console.log(`Environment variable is ${enviornment.envName}`)
        console.log(`listening to port ${server.config.port}`)
    })
}

//handle request responce

server.handleReqRes = handleReqRes;

//start the server

server.init = () =>{
    server.createServer();
}

//export server

module.exports =server