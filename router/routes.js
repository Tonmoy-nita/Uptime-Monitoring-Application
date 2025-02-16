// Title :Routes
// Description :Application Routes



//dependencies

const{sampleHandler} = require('../handlers/routeHandlers/sampleHandler.js')
const {userHandler} =require('../handlers/routeHandlers/userHandler.js')
const {tokenHandler} =require('../handlers/routeHandlers/tokenHandler.js')
const {checkHandler} =require('../handlers/routeHandlers/checkHandler.js')


const routes ={
    sample : sampleHandler,
    user :userHandler,
    token : tokenHandler,
    check : checkHandler,
}

module.exports =routes;