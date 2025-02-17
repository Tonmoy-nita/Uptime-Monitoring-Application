/*
Title : Notifications Library
Description  : Important functions to notify users

*/

//dependencies
const https= require('https')
const querystring =require('querystring')
const {twilio} =require('./enviornment.js')
const { hostname } = require('os')


//module scaffolding

notifications={}

//send sms to user using twillio api

notifications.sendTwilioSms=(phone, msg,callback)=>{
    //input validation
    const userPhone = typeof phone==='string'
    && phone.trim().length === 10 
    ?phone.trim() : false

    const userMsg = typeof msg==='string'
    && msg.trim().length > 0 && msg.trim().length <=1600
    ?msg.trim() : false

    if(userPhone && userMsg){
        // request r jonno proyojonio jinis gulo niye feli akta object r modhye
        //configure the request payload
        const payload = {
            From :twilio.fromPhone,
            To : `+91${userPhone}`,
            Body : userMsg,
        }
        //valid javascript object hisab e request pathano jai na pathate hobe stringify kore
        //stringify the payload
        const stringifyPayload = querystring.stringify(payload)

        //configure the request details
        const requestDetails = {
            hostname : 'api.twilio.com',
            method : 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth : `${twilio.accountSid}:${twilio.authToken}`,
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded',
            },
        }
        //request pathanor jonno request intatiate korte hobe
        //instantiate the request object

        const req = https.request(requestDetails,(res)=>{
            //response pathanor jonno callback function call korte hobe
            // get the status of the sent request
            const status = res.statusCode
            //callback successfully if the request went through
            if(status===200 || status ==201){
                callback(false)
            }
            else{
                callback(`Status code return was ${status}`)
            }
        })
        req.on('error',(reqErr)=>{
            callback(reqErr);
        })
        req.write(stringifyPayload)
        req.end()
    }
    else{
        callback('Given parameters were missing or invalid !')
    }
}

module.exports = notifications;