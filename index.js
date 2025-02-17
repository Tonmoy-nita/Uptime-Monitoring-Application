//Title :Uptime Monitoring Application Project Initial file
//Description : INitial file to start the node server and the workers


const server = require('./lib/server.js')
const workers = require('./lib/worker.js')

const app = {};


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

//@TODO - remove leter
// sendTwilioSms(process.env.MYNUM,'হাল ছেড়ে দিও না, সময় যখন কঠিন, তখনই তোমার লড়াইয়ের আসল পরীক্ষা! আজকের কষ্ট, আগামী দিনের শক্তি।' ,(err)=>{
//     console.log('This is the error message',err);
// })


app.init = () => {
    //start the server 

    server.init()

    //start the workers

    workers.init()
}

app.init();

module.exports =app
