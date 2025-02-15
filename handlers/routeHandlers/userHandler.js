// Title : User handler
// Description : Handler to handle user realated routes

//Dependencies
const { last } = require("lodash")
const data =require("../../lib/data.js")
const {hash}=require('../../helpers/utilities.js')
const {parseJSON}=require('../../helpers/utilities.js')



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
    //check the phone number if valid
    const phone = typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 10 ?
        requestProperties.queryStringObject.phone.trim() : false;
    console.log(phone)
    if (phone) {
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
    } else {
        callback(400, {
            error: 'Invalid phone number format!'
        });
    }
};

handler._user.post = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;

    const phoneNo = typeof(requestProperties.body.phoneNo) === 'string' &&
        requestProperties.body.phoneNo.trim().length === 10 ? requestProperties.body.phoneNo.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' ?
        requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phoneNo && password && tosAgreement) {
        // Check if user already exists
        data.read('user', phoneNo, (readErr, user) => {
            if (readErr) { // User does not exist (this is correct logic)
                let userObject = {
                    firstName,
                    lastName,
                    phoneNo,
                    password: hash(password),
                    tosAgreement
                };

                // Store the user in the data file system
                data.create('user', phoneNo, userObject, (createMessage) => {
                    if (createMessage === 'File created successfully') {
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
    const firstName = typeof requestProperties.body.firstName === "string" &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;

    const lastName = typeof requestProperties.body.lastName === "string" &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;

    const phoneNo = typeof requestProperties.body.phoneNo === "string" &&
        requestProperties.body.phoneNo.trim().length === 10 ? requestProperties.body.phoneNo.trim() : false;

    const password = typeof requestProperties.body.password === "string" &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if (phoneNo) {
        if(firstName || lastName || password){
            data.read('user',phoneNo,(err1,user)=>{
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
                    data.update('user',phoneNo,userData,(err2)=>{
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

module.exports = handler;


handler._user.delete = (requestProperties, callback)=>{

}


module.exports = handler;