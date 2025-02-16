// Dependencies
const fs = require('fs');
const path = require('path');

// Module scaffolding
const lib = {};

// Base directory of the .data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Create a file - if the subfolder exist then create a file inside subforlder and write on it 
//               - if the subfolder does not exist then create the subfolder and then create a file inside it and write on it
//               - if the file already exist then do nothing
//               - if the file only not exist then it create file and write on it
lib.create = (dirName, fileName, data, callback) => {
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);

    // Step 1: Check if the subfolder exists, if not, create it
    if (!fs.existsSync(subFolderPath)) {
        fs.mkdirSync(subFolderPath, { recursive: true });
    }

    // Step 2: Check if the file already exists
    if (fs.existsSync(filePath)) {
        return callback('Error: File already exists');
    }

    // Step 3: Create and write to the file
    fs.open(filePath, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data, null, 4);

            fs.writeFile(fileDescriptor, stringData, (writeErr) => {
                if (!writeErr) {
                    fs.close(fileDescriptor, (closeErr) => {
                        if (!closeErr) {
                            callback(false);
                        } else {
                            callback('Error in closing file');
                        }
                    });
                } else {
                    callback('Writing to file failed: ' + writeErr);
                }
            });
        } else {
            callback(`Error in creating file: ${filePath}`);
        }
    });
};


//read a file - if the file exist then read it and return the data
//            - if the filepath does not exist then it return error

lib.read=(dirName,fileName,callback) => {
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);
    // console.log(filePath)
    if(fs.existsSync(filePath)){
        fs.readFile(`${filePath}`,`utf8`,(err,data)=>{
            if(!err && data){
                callback(null,data)
            }
            else{
                callback("File is not readable due to ",+ err)
            }
        })
    }
    else{
        callback('File not found check your directory and file name')
    }
}


//update a file - if given type is "update existing" then data is written inside the file after previous data present
//              - if given type is anything else (new data insert) then it will erase (ftruncate) previous data inside the file and write new data inside the file

lib.update = (dirName, fileName, data, callback) => {
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);

    fs.open(`${filePath}`,'r+',(err, fileDescriptor)=>{
        //convert the data to string
        if(!err && fileDescriptor){
            const stringData=JSON.stringify(data);

            //truncate the file
            fs.ftruncate(fileDescriptor,(err1)=>{
                if(!err1){
                    fs.writeFile(fileDescriptor,stringData,(err2)=>{
                        if(!err2){
                            fs.close(fileDescriptor,(err3)=>{
                                if(!err3){
                                    callback(false);
                                }
                                else{
                                    callback("Error closing file", null);
                                }
                            })
                        }
                        else{
                            callback("Error writing to file", null);
                        }
                    })
                }
                else{
                    console.log("Error truncating file");
                }
            })
        }
        else{
            console.log('Error updating .File may not exist')
        }
})
};



//delete a file - if the file path is present then it will delete the file
//              - if the file path is not present then it will return err that file is not found

lib.delete =(dirName,fileName,callback)=>{
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);
    if(fs.existsSync(filePath)){
        fs.unlink(filePath,(unlinkerr)=>{
            if(!unlinkerr){
                callback(false)
            }
            else{
                callback('There is an error in unlink or delete the file',+unlinkerr)
            }
        })
    }
    else{
        callback('Your entered file path is not available')
    }
}


// Export the module
module.exports = lib;
