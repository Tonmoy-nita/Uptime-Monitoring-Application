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

//create Random string
utilites.createRandomString= (strlen) =>{
    let length =strlen;
    length =typeof(strlen) ==='number' && strlen > 0 ? strlen :false ;
    if(length){
        let possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 0; i < length; i++) {
            output += possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));
        }
        return output;
    }
    else{
        return false;
    }
}

module.exports =utilites