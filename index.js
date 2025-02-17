//Title :Uptime Monitoring Application
//Description : A RESTFul API to monitoring up or down time of user definedlinks


const http = require('http')
const dotenv = require('dotenv');
const {handleReqRes} =require('./helpers/handleReqRes.js')
const enviornment =require('./helpers/enviornment.js')
const data=require('./lib/data.js')
const {sendTwilioSms} = require('./helpers/notifications.js')

// Load environment variables//.env config


const app={}
//file write(directory name, file name , data ,callback)

// data.create("New Folder","file",{name : 'Your Name', message : 'I love my hometown'},(err)=>{
//     console.log(err);
// })


// file update(directory name,file name, data,callback)

// data.update("user","1111111111",{country: 'India' ,ph_no : '+010000000'},(err)=>{
//     console.log(err);
// })



// file read(directory name, file name , callback)

// data.read("Folder","file",(err)=>{
//     console.log(err);
// })




//file delete (directory name,file name ,callback)

// data.delete("New Folder","file",(err)=>{
//     console.log(err);
// })

//delete existing file


sendTwilioSms(process.env.MYNUM,'হাল ছেড়ে দিও না, সময় যখন কঠিন, তখনই তোমার লড়াইয়ের আসল পরীক্ষা! আজকের কষ্ট, আগামী দিনের শক্তি।' ,(err)=>{
    console.log('This is the error message',err);
})


app.createServer =()=>{
    const server=http.createServer(app.handleReqRes) 
    server.listen(enviornment.port,()=>{
        console.log(`Environment variable is ${enviornment.envName}`)
        console.log(`listening to port ${enviornment.port}`)
    })
}

app.handleReqRes = handleReqRes;
app.createServer();