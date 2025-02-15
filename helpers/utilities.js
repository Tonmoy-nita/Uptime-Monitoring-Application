//Title: Utilities Handler
//Description : Important utilites function

//dependencies
const crypto =require('crypto');
const enviornment = require('./enviornment.js')
//module scaffolding

const utilites={}

//parse JSON string to object

utilites.parseJSON= (jsonString) =>{
    let output ={}
    try {
        output = JSON.parse(jsonString)
    } catch (error) {
        output={}
    }

    return output
}



utilites.hash= (str) =>{
   if(typeof(str)==='string' && str.length>0){
    let hash = crypto.createHash('sha256',enviornment.secretKey).update('str').digest('hex');
    // console.log(hash);
    return hash;
   }
   else{
    return false;
   }
}

module.exports =utilites