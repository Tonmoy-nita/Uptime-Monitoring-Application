// Title :Routes
// Description :Application Routes



//dependencies

const{sampleHandler} = require('../handlers/routeHandlers/sampleHandler.js')

const routes ={
    sample : sampleHandler,
}

module.exports =routes;