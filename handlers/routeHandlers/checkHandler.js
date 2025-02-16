// Title : Check handler
// Description : Handler to handle user defined checks

//Dependencies
const { last } = require("lodash")
const data =require("../../lib/data.js")
const {parseJSON, createRandomString}=require('../../helpers/utilities.js')
const tokenHandler = require('./tokenHandler.js')
const {maxChecks} = require('../../helpers/enviornment.js')



const handler ={}
handler.checkHandler =(requestProperties, callback)=>{
    const ecceptedMethods=['get','post','put', 'delete']
    if(ecceptedMethods.indexOf(requestProperties.method)>-1){
        handler._check[requestProperties.method](requestProperties,callback)
    }
    else{
        callback(405,{
            message : 'Method not allowed',
        })
    }
    // callback(200,{
    //     message :'This is a user handler',
    // })
}

handler._check={}

handler._check.post = (requestProperties, callback) => {
    //validate inputs
    const protocol = typeof(requestProperties.body.protocol)==='string' 
    && ['http','https'].indexOf(requestProperties.body.protocol) >-1
    ? requestProperties.body.protocol : false;

    const url = typeof(requestProperties.body.url)==='string' 
    && requestProperties.body.url.trim().length>0
    ? requestProperties.body.url : false;

    const method = typeof(requestProperties.body.method)==='string'
    && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1
    ? requestProperties.body.method : false;

    const successCodes = typeof(requestProperties.body.successCodes)==='object'
    && requestProperties.body.successCodes instanceof Array 
    ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds)==='number'
    && requestProperties.body.timeoutSeconds %1 === 0 && requestProperties.body.timeoutSeconds >=1
    && requestProperties.body.timeoutSeconds <=5
    ? requestProperties.body.timeoutSeconds : false;

    // console.log(protocol)
    // console.log(url)
    // console.log(method)
    // console.log(successCodes)
    // console.log(timeoutSeconds)
    if(protocol && url && method && successCodes && timeoutSeconds){
        const token = typeof(requestProperties.headersObject.token)==='string' ?
        requestProperties.headersObject.token : false

        //token r sathe associate j phone number a6he amra seta niye asbo

        data.read('tokens',token,(tokenReadErr, tokenData)=>{
            if(!tokenReadErr && tokenData){
                let userPhone = parseJSON(tokenData).phone
                // lookup the user data
                data.read('user',userPhone,(userReadErr, userData)=>{
                    if(!userReadErr && userData){
                        tokenHandler._token.verify(token,userPhone,(tokenIsValid)=>{
                            if(tokenIsValid){
                                let userObject = parseJSON(userData)
                                let userChecks = typeof(userObject.checks) ==='object' && userObject.checks instanceof Array 
                                ? userObject.checks : []
                                if(userChecks.length < maxChecks){
                                    let checkId=createRandomString(20)
                                    let checkObject = {
                                        'id' : checkId ,
                                        userPhone ,
                                        protocol ,
                                        url ,
                                        method,
                                        successCodes ,
                                        timeoutSeconds ,
                                    }

                                    data.create('checks', checkId, checkObject,(checkCreateErr,checkData)=>{
                                        if(!checkCreateErr){
                                            //add checkId to the user object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user data

                                            data.update('user',userPhone, userObject,(userUpdateErr,userData)=>{
                                                if(!userUpdateErr){
                                                    //return data about the new checks
                                                    callback(200, checkObject)
                                                }
                                                else{
                                                    callback(500,{
                                                        'error' : 'Could not update the user server side problem',
                                                    })
                                                }
                                            })
                                        }
                                        else{
                                            callback(500,{
                                                error : 'There was a problem in the server side !'
                                            })
                                        }
                                    })
                                }
                                else{
                                    callback(401,{
                                        error: 'max number of checks reached'
                                    })
                                }

                            }
                            else{
                                callback(403,{
                                    error : 'Authentication failed ! token is not matching for entered phone number.'
                                })
                            }
                        })
                    }
                    else{
                        callback(403,{
                            error : 'User not found'
                        })
                    }
                })
            }
            else{
                callback(403,{
                    error : 'authentication error'
                })
            }
        })
    }
    else{
        callback(400,{
            error : 'You have a problem in your input'
        })
    }
};

handler._check.get = (requestProperties, callback)=>{
    const id = typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id.trim() : false;

    if(id){
        //lookup the checks
        data.read('checks', id ,(readErr, checkData)=>{
            if(!readErr && checkData){
                const token = typeof(requestProperties.headersObject.token)==='string' ?
                requestProperties.headersObject.token : false
                tokenHandler._token.verify(token,parseJSON(checkData).userPhone,(tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200,parseJSON(checkData))
                    }
                    else{
                        callback(403,{
                            error: 'Authentication failure'
                        })
                    }
                })
            }
            else{
                callback(500,{
                    error : 'Could not find check with that ID'
                })
            }
        })
    }
    else{
        callback(400,{
            error : 'You have a problem in your request'
        })
    }
};

handler._check.put = (requestProperties, callback) => {

    const id = typeof requestProperties.body.id === 'string' &&
            requestProperties.body.id.trim().length === 20 ?
            requestProperties.body.id.trim() : false;

    const protocol = typeof(requestProperties.body.protocol)==='string' 
            && ['http','https'].indexOf(requestProperties.body.protocol) >-1
            ? requestProperties.body.protocol : false;
        
    const url = typeof(requestProperties.body.url)==='string' 
            && requestProperties.body.url.trim().length>0
            ? requestProperties.body.url : false;
        
    const method = typeof(requestProperties.body.method)==='string'
            && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1
            ? requestProperties.body.method : false;
        
    const successCodes = typeof(requestProperties.body.successCodes)==='object'
            && requestProperties.body.successCodes instanceof Array 
            ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds)==='number'
            && requestProperties.body.timeoutSeconds %1 === 0 && requestProperties.body.timeoutSeconds >=1
            && requestProperties.body.timeoutSeconds <=5
            ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method|| successCodes || timeoutSeconds){
            data.read('checks',id,(checkReadErr,checkData)=>{
                if(!checkReadErr && checkData){
                    let checkObject = parseJSON(checkData)
                    const token = typeof(requestProperties.headersObject.token)==='string' ?
                    requestProperties.headersObject.token : false
                    tokenHandler._token.verify(token,checkObject.userPhone,(tokenIsValid)=>{
                        // console.log(checkObject)
                        if(tokenIsValid){
                            if(protocol) checkObject.protocol = protocol
                            if(url) checkObject.url = url
                            if(method) checkObject.method = method
                            if(successCodes) checkObject.successCodes = successCodes
                            if(timeoutSeconds) checkObject.timeoutSeconds = timeoutSeconds
                            data.update('checks',id,checkObject,(updateCheckErr)=>{
                                if(!updateCheckErr ){
                                    callback(200,{
                                        error : 'check updated succcessfully'
                                    })
                                }
                                else{
                                    callback(400,{
                                        error : 'There was an issue on the server side'
                                    })
                                }
                            })
                        }
                        else{
                            callback(403,{
                                error : 'Authentication Error'
                            })
                        }
                    })
                }
                else{
                    callback(404,{
                        error : 'Could not find check with that ID'
                    })
                }
            })
        }
        else{
            callback(400,{
                error : 'You must provide at least one field to update'
            })
        }
    }
    else{
        callback(400,{
            error : 'You have problem in your request invalid ID'
        })
    }
};

handler._check.delete = (requestProperties, callback)=>{
    const id = typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id.trim() : false;

    if(id){
        //lookup the checks
        data.read('checks', id ,(readErr, checkData)=>{
            if(!readErr && checkData){
                const token = typeof(requestProperties.headersObject.token)==='string' ?
                requestProperties.headersObject.token : false
                tokenHandler._token.verify(token,parseJSON(checkData).userPhone,(tokenIsValid)=>{
                    if(tokenIsValid){
                        data.delete('checks',id,(deleteCheckErr)=>{
                            if(!deleteCheckErr){
                            data.read('user',parseJSON(checkData).userPhone,(readUserErr,userData)=>{
                                let userObject =parseJSON(userData)
                                if(!readUserErr && userData){
                                    let userChecks = typeof(userObject.checks)==='object' 
                                    && userObject.checks instanceof Array ? userObject.checks : [];

                                    //remove the deleted check id from the user's list of checks
                                    const checkPosition = userChecks.indexOf(id);
                                    if(checkPosition > -1){
                                        userChecks.splice(checkPosition, 1)

                                        userObject.checks=userChecks;
                                        data.update('user',userObject.phone,userObject,(updateUserErr)=>{
                                            if(!updateUserErr){
                                                callback(200,{
                                                    message : 'Check deleted and user updated successfully'
                                                })
                                            }
                                            else{
                                                callback(400,{
                                                    error : 'Could not update the user in our db'
                                                })
                                            }
                                        })
                                    }
                                    else{
                                        callback(404,{
                                            error : 'Could not find check with that ID'
                                        })
                                    }
                                }
                            })
                            }
                            else{
                                callback(500,{
                                    error : 'This is server side issue !Could not delete the check'
                                })
                            }
                        })
                    }
                    else{
                        callback(403,{
                            error: 'Authentication failure'
                        })
                    }
                })
            }
            else{
                callback(500,{
                    error : 'Could not find check with that ID'
                })
            }
        })
    }
    else{
        callback(400,{
            error : 'You have a problem in your request'
        })
    }
}


module.exports = handler;