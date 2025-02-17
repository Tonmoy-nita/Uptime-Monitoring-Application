//Title :Worker Library
//Description : worker related files

//dependencies

const url = require('url');
const data= require('./data.js')
const http = require('http')
const https = require('https')
const {parseJSON} = require('../helpers/utilities.js')
const {sendTwilioSms} =require('../helpers/notifications.js')


//worker object - module scaffolding

const worker={}

//look up all the checks from the .data

worker.gatherAllChecks = () =>{
    //get all the checks
    data.list('checks',(listErr, checks)=>{
        if(!listErr && checks && checks.length > 0){
            checks.forEach(check => {
                //read the checkData
                data.read('checks',check,(checkReadErr,originalCheckData)=>{
                    if(!checkReadErr && originalCheckData){
                        //pass the data to the next process - checks data validataion
                        worker.validateCheckData(parseJSON(originalCheckData))
                    }
                    else{
                        console.log('Error reading one of the checks data')
                    }
                })
            });
        }
        else{
            console.log('Error could not find any checks to process')
        }
    })
}

//validate individual check data

worker.validateCheckData = (originalCheckData) =>{
    const originalData = originalCheckData
    //check if the check data is valid
    if(originalData && originalData.id){
        originalData.state = typeof(originalData.state) ==='string' 
        && ['up','down'].indexOf(originalData.state) > -1  ? originalData.state : 'down'

        originalData.lastChecked = typeof(originalData.lastChecked) === 'number' && originalData.lastChecked > 0
        ?originalData.lastChecked : false

        //pass to the next process

        worker.performCheck(originalData)
    }
    else{
        console.log('Error : Check data invalid or not properly formatted')
    }
}

//perform check on the check data

worker.performCheck = (originalData) => {
    //prepare the initial check outcome
    let checkOutcome = {
        'error' : false,
        'responseCode' : false
    }
    //mark the outcome has not been sent yet
    let outcomeSent = false
    //parse the url from the original data
    //parse the hostname and full url from the origianl data
    let parsedUrl = url.parse(originalData.protocol + '://' + originalData.url , true)
    let hostname = parsedUrl.hostname
    const path = parsedUrl.path

    // construct the request

    const requestDetails = {
        'protocol' : originalData.protocol + ':',
        'hostname' : hostname,
        'method' : originalData.method.toUpperCase(),
        'path' : path,
        'timeout' : originalData.timeoutSeconds*1000,
    }
    //ekhane amra dekhbo kon method amader use korte hobe

    const protocolToUse = originalData.protocol === 'http' ? http : https;


    let req = protocolToUse.request(requestDetails,(res)=>{
        //check if the response status code is 200
        let status = res.statusCode
        // console.log(status)
        //update the check outcome and pass to the next process

        checkOutcome.responseCode = status

        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutcome)
            outcomeSent = true
        }
    });

    req.on('error' ,(err)=>{
        let checkOutcome = {
            'error' : true,
            'Value' : err,
        }
        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutcome)
            outcomeSent = true
        }
    })

    req.on('timeout' , (timeoutErr)=>{
        let checkOutcome = {
            'error' : true,
            'Value' : 'timeout',
        }
        if(!outcomeSent){
            worker.processCheckOutcome(originalData, checkOutcome)
            outcomeSent = true
        }
    })
    req.end();
}


//save check outcome  to database and send to next process

worker.processCheckOutcome = (originalData , checkOutcome) =>{
    //check if check outcome is up or down
    const state = !checkOutcome.error && checkOutcome.responseCode 
    && originalData.successCodes.indexOf(checkOutcome.responseCode)>-1 ? 'up' : 'down'

    // decide wheather we should alert the user or not
    const aleartWanted = !!(originalData.lastChecked && originalData.state !== state)

    //update the check data
    let newCheckData = originalData

    newCheckData.state = state
    newCheckData.lastChecked = Date.now()

    //update the check to disk

    data.update('checks', newCheckData.id, newCheckData ,(updateErr)=>{
        if(!updateErr){
            //send the check data to next process
            if(aleartWanted){
                worker.alertUserToStatusChange(newCheckData)
            }
            else{
                console.log('Alert is not needed as their is no step change !')
            }
        }
        else{
            console.log('Error :  trying to save check data of one of the checks !')
        }
    })
}

//send notifiaction sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) =>{
    let msg = `Alert : your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`

    sendTwilioSms(newCheckData.userPhone,msg,(err)=>{
        if(!err){
            console.log(`User was alerted to a status change via SMS : ${msg}`)
        }
        else{
            console.log('There was a problem sending sms to one of the user !')
        }
    })

}


//timer to execute the worker process once per miniute

worker.loop= () =>{
    setInterval(()=>{
        worker.gatherAllChecks()
    },1000*10)
}

//start the workers

worker.init = () =>{
    //execute all the checks

    worker.gatherAllChecks();

    //call the loop so that checks continue

    worker.loop()
}

//export server

module.exports =worker