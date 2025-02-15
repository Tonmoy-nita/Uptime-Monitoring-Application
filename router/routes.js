// Title :Routes
// Description :Application Routes



//dependencies

const{sampleHandler} = require('../handlers/routeHandlers/sampleHandler.js')
const {userHandler} =require('../handlers/routeHandlers/userHandler.js')

const routes ={
    sample : sampleHandler,
    user :userHandler,
}

module.exports =routes;