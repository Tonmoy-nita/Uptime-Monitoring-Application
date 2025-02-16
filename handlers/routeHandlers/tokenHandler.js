/*
Title : Token Handler
Description  : Handler to handle token related routes

*/

//Dependencies
const data =require('../../lib/data.js')
const {hash}=require('../../helpers/utilities.js')
const {createRandomString} =require('../../helpers/utilities.js')
const {parseJSON}=require('../../helpers/utilities.js')


//module scaffoling
const handler = {};

handler.tokenHandler  =(requestProperties, callback)=>{
    const ecceptedMethods=['get','post','put', 'delete']
    if(ecceptedMethods.indexOf(requestProperties.method)>-1){
        handler._token[requestProperties.method](requestProperties,callback)
    }
    else{
        callback(405,{
            message : 'Method not allowed',
        })
    }
}

handler._token ={}

handler._token.post=(requestProperties, callback) => {
    const phone = typeof(requestProperties.body.phone) === 'string' &&
        requestProperties.body.phone.trim().length === 10 ? requestProperties.body.phone.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if(phone && password){
        data.read('user',phone,(err1,userData)=>{
            const hashedPassword = hash(password);
            if(hashedPassword===parseJSON(userData).password){
                let tokenId = createRandomString(20)
                let expires = Date.now() *60*60 *1000
                let tokenObject={
                    phone,
                    'id' : tokenId,
                    expires
                }

                //store the token
                data.create('tokens', tokenId, tokenObject, (err2)=>{
                    if(!err2){
                        callback(200,tokenObject)
                    }
                    else{
                        callback(500,{
                            error : 'There is problem from server side'
                        })
                    }
                })
            }
            else{
                callback(400,{
                    error : 'Password does not match'
                })
            }
        })
    }
    else{
        callback(400,{
            error : 'Check your phone number and password'
        })
    }
}

handler._token.get=(requestProperties, callback) => {
    //if the request send from url header section queryString(id) then we use this method

    const id = typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id.trim() : false;

    //if the request send from body section then we use this method
    /*
    const id = typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20 ?
    requestProperties.body.id.trim() : false;
    */
        if (id) {
            data.read('tokens', id, (err, tokenData) => {
                const token={...parseJSON(tokenData)}
                if (!err && token) {
                    callback(200,token);
                } else {
                    // console.log(err);
                    callback(404, {
                        error: 'Requested token not found'
                    });
                }
            });
        } else {
            callback(400, {
                error: 'Invalid id!'
            });
        }
}

handler._token.put=(requestProperties, callback) => {
    const id = typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20 ?
    requestProperties.body.id.trim() : false;

    const extend = typeof requestProperties.body.extend === 'boolean' &&
    requestProperties.body.extend === true ? true : false;

    if(id && extend){
        data.read('tokens',id,(readTokenErr,tokenData)=>{
            let tokenObject = {...parseJSON(tokenData)}
            if(tokenObject.expires>Date.now()){
                tokenObject.expires=Date.now()+1000*60*60;
                //akhon token r expiry time update korte hobe
                data.update('tokens',id,tokenObject,(updateTokenErr)=>{
                    if(!updateTokenErr){
                        callback(200,{
                            message :'Token updated successfully'})
                    }
                    else{
                        callback(500,{
                            error: 'There was a server side error'
                        })
                    }
                })
            }
            else{
                error : 'Token already expired'
            }
        })
    }
    else{
        callback(404,{
            error : 'There was a problem in your request'
        })
    }
}

handler._token.delete=(requestProperties, callback) => {

    //if the request send from url header section queryString(id) then we use this method

    const id = typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id.trim() : false;

    //if the request send from body section then we use this method
    /*
    const id = typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20 ?
    requestProperties.body.id.trim() : false;
    */
            if(id){
                    data.read('tokens',id,(readErr,tokenData)=>{
                        // const userData = {...parseJSON(data)}
                        if(!readErr && tokenData){
                            data.delete('tokens',id,(deleteErr)=>{
                                if(!deleteErr){
                                    callback(200,{
                                        callback : 'Token deleted successfully'
                                    })
                                }
                                else{
                                    callback(500,{
                                        error: 'Token was not deleted due to server issue'
                                    })
                                }
                            })
                        }else{
                            callback(500,{
                                error : 'There was a problem in server side',
                            })
                        }
                    })
                }
                else{
                    callback(400,{
                        error:'Please check your creadential (like phone in your header querystring)'
                    })
                }
}


handler._token.verify = (id, phone, callback) =>{
    data.read('tokens',id,(tokenReadErr,tokenData)=>{
        if(!tokenReadErr && tokenData){
            if(parseJSON(tokenData).phone===phone && parseJSON(tokenData).expires>Date.now()){
                callback(true)
            }
            else{
                callback(false)
            }
        }
        else{
            callback(false)
        }
    })
}

module.exports =handler