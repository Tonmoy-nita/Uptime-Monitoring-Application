// Title : User handler
// Description : Handler to handle user realated routes

//Dependencies
const { last } = require("lodash")
const data =require("../../lib/data.js")
const {hash}=require('../../helpers/utilities.js')
const {parseJSON}=require('../../helpers/utilities.js')
const tokenHandler = require('./tokenHandler.js')



const handler ={}
handler.userHandler =(requestProperties, callback)=>{
    const ecceptedMethods=['get','post','put', 'delete']
    if(ecceptedMethods.indexOf(requestProperties.method)>-1){
        handler._user[requestProperties.method](requestProperties,callback)
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

handler._user={}

handler._user.get = (requestProperties, callback)=>{
    //for get the information of the user you have to give phone number in the requested url header section in header.queryStringObject
    //check the phone number if valid
            //if the request send from url header section queryString(id) then we use this method

            const phone = typeof requestProperties.queryStringObject.phone === 'string' &&
            requestProperties.queryStringObject.phone.trim().length === 10 ?
            requestProperties.queryStringObject.phone.trim() : false;
    
            //if the request send from body section then we use this method
            /*
            const phone = typeof requestProperties.body.phone === 'string' &&
            requestProperties.body.phone.trim().length === 20 ?
            requestProperties.body.phone.trim() : false;
            */
            
    if (phone) {
        //verify token
        let token = typeof(requestProperties.headersObject.token)==='string' ?
        requestProperties.headersObject.token : false
        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                data.read('user', phone, (err, user) => {
                    if (!err && user) {
                        const userdetail = { ...parseJSON(user) };
                        delete userdetail.password;
                        callback(200, userdetail);
                    } else {
                        // console.log(err);
                        callback(404, {
                            error: 'Requested user not found'
                        });
                    }
                });
            }
            else{
                callback(403,{
                    error : 'You are not authenticated'
                })
            }
        })    
    } else {
        callback(400, {
            error: 'Invalid phone number format!'
        });
    }
};

handler._user.post = (requestProperties, callback) => {
    //for posting details in a file you have to give information of firstName,lastName,phoneNo,password and tos Agreement all the needed creadentials in the request body section
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;

    const phone = typeof(requestProperties.body.phone) === 'string' &&
        requestProperties.body.phone.trim().length === 10 ? requestProperties.body.phone.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' ?
        requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Check if user already exists
        data.read('user', phone, (readErr, user) => {
            if (readErr) { // User does not exist (this is correct logic)
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };

                // Store the user in the data file system
                data.create('user', phone, userObject, (createMessage) => {
                    if (!createMessage) {
                        callback(200, {
                            message: 'User created successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create user!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'User already exists',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You did not provide all the required fields',
        });
    }
};

handler._user.put = (requestProperties, callback) => {
    //here all the details firstName,lastName,PhoneNo,password was received from requestd url body
    const firstName = typeof requestProperties.body.firstName === "string" &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;

    const lastName = typeof requestProperties.body.lastName === "string" &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;

    const phone = typeof requestProperties.body.phone === "string" &&
        requestProperties.body.phone.trim().length === 10 ? requestProperties.body.phone.trim() : false;

    const password = typeof requestProperties.body.password === "string" &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if (phone) {
        if(firstName || lastName || password){
        let token = typeof(requestProperties.headersObject.token)==='string' ?
        requestProperties.headersObject.token : false
        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                data.read('user',phone,(err1,user)=>{
                    const userData= {...parseJSON(user)}
                    if(!err1 && userData){
                        if(firstName){
                            userData.firstName=firstName
                        }
                        if(lastName){
                            userData.lastName=lastName
                        }
                        if(password){
                            userData.password=hash(password)
                        }
                        data.update('user',phone,userData,(err2)=>{
                            if(!err2){
                                callback(200,{
                                    message: 'User updated successfully',
                                })
                            }
                            else{
                                callback(500, {
                                    error: 'There was a problem in server side',
                                })
                            }
                        })
                    }
                    else{
                        callback(404,{
                            error: 'User not found',
                        })
                    }
                })
            }
            else{
                callback(403,{
                    error : 'You are not authenticated'
                })
            }
        })         
    }
        else{
            callback(400,{
                error: "You have a problem in your request",
            })
        }
    }
    else{
        callback(400,{
            error: "You did not provide all the required fields",
        })
    }
};

handler._user.delete = (requestProperties, callback)=>{
    //this check phone accepted from the requested url header section header.queryStringObject
        //if the request send from url header section queryString(id) then we use this method

        const phone = typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 10 ?
        requestProperties.queryStringObject.phone.trim() : false;

        //if the request send from body section then we use this method
        /*
        const phone = typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 20 ?
        requestProperties.body.phone.trim() : false;
        */
    if(phone){
        let token = typeof(requestProperties.headersObject.token)==='string' ?
        requestProperties.headersObject.token : false
        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                data.read('user',phone,(readErr,userdata)=>{
                    // const userData = {...parseJSON(data)}
                    if(!readErr && userdata){
                        data.delete('user',phone,(deleteErr)=>{
                            if(!deleteErr){
                                callback(200,{
                                    callback : 'file deleted successfully'
                                })
                            }
                            else{
                                callback(500,{
                                    error: 'File was not deleted due to server issue'
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
                callback(403,{
                    error : 'You are not authenticated'
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


module.exports = handler;