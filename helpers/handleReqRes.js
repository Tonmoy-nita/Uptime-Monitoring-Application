//title : Handle request responce
//description : handle request and responce


//dependencies
const url = require('url')
const {StringDecoder} = require('string_decoder')
const routes =require('../router/routes.js')
const {notFoundHandler} =require('../handlers/routeHandlers/notFoundHandlers.js')
const {parseJSON}= require('./utilities.js')


//module scarffolding
const handler ={}
//handle request responce
handler.handleReqRes = (req, res) => {
    //handle request
    //header niye kaj ba header r request handle
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true)
    // console.log(parsedUrl)

    const path =parsedUrl.pathname
    // console.log(path)

    const trimmedPath = path.replace(/^\/+|\/+$/g, '')
    // console.log(trimmedPath)

    const method = req.method.toLowerCase();
    // if(method=='get')
    // console.log(method)
    
    const queryStringObject =parsedUrl.query
    // console.log(queryStringObject)

    //ki ki header a6he req e 
    const headersObject = req.headers;
    // console.log(headersObject);


    const requestProperties ={
        parsedUrl,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    }

    //url body or payload nniye kaj
    const decoder = new StringDecoder('utf-8')
    let realData =' '
    console.log(trimmedPath)
    const chosenHandler=routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler
    // console.log(chosenHandler);

   

    req.on('data',(buffer)=>{
        realData+=decoder.write(buffer)
    })
    // console.log(realData)
    req.on('end',()=>{
        realData +=decoder.end();
        requestProperties.body = parseJSON(realData)
        chosenHandler(requestProperties ,(statusCode, payload)=>{

            statusCode = typeof(statusCode) === 'number' ? statusCode : 500
            payload =typeof(payload) ==='object' ? payload : {}
    
            const payloadString = JSON.stringify(payload);
    
            //return the final responce
            console.log(realData)
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(payloadString);
        })
        // res.end('data sent successfully') 
    })
    
    


    //nicher comment tuku amar nijer bojhar subidhar jonno banano code
    // res.writeHead(200,{'Content-Type' : 'application/json'})
    // const responceData ={
    //     message : 'Hello from server , this is a JSON responce !',
    //     status : 'success',
    //     timeStamp : new Date().toISOString()
    // }
    // res.send(JSON.stringify(responceData));//http মডিউলে res.send() নেই, তাই res.end(JSON.stringify(responseData)) ব্যবহার করো।
    //atotuku


    //responce handle
    // res.end('Hello Programmers');
}
module.exports = handler;