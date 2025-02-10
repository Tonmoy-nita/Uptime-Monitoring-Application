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
                            callback('File created successfully');
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
            if(!err){
                callback(data)
            }
            else{
                callback("File is not readable due to ",err)
            }
        })
    }
    else{
        callback('File not found check your directory and file name')
    }
}


//update a file - if given type is "update existing" then data is written inside the file after previous data present
//              - if given type is anything else (new data insert) then it will erase (ftruncate) previous data inside the file and write new data inside the file

lib.update = (dirName,fileName, type ,data ,callback)=>{
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);
    if(fs.existsSync(filePath)){
        //open file location
        fs.open(filePath, 'r+', (openerr, fileDescriptor)=>{
            if(!openerr && fileDescriptor){
                if(type =="update existing"){
                    fs.readFile(filePath, 'utf8', (readErr, fileData) => {
                        if (!readErr && fileData) {
                            let existingData = {};
                            try {
                                existingData = JSON.parse(fileData);
                                const updatedData = { ...existingData, ...data };
                                const stringData = JSON.stringify(updatedData, null, 2);

                                fs.appendFile(fileDescriptor,stringData,(appenederr)=>{
                                    if(!appenederr){
                                        fs.close(fileDescriptor,(closeerr)=>{
                                            if(!closeerr){
                                                callback('succesful')
                                            }
                                            else{
                                                callback('Error in closing')
                                            }
                                        });
                                    }
                                    else{
                                        callback('Error in updating data in existing file',appenederr)
                                    }
                                })
                            } catch (parseErr) {
                                return callback('Error parsing existing JSON data', parseErr);
                            }
                        }
                        else{
                            const stringData = JSON.stringify(data, null, 2);
                            fs.ftruncate(fileDescriptor,(truncateerr)=>{
                                if(!truncateerr){
                                    fs.writeFile(fileDescriptor,stringData,(writeerr)=>{
                                        if(!writeerr){
                                            fs.close(fileDescriptor,(closeerr)=>{
                                                if(!closeerr){
                                                    callback('succesful')
                                                }
                                                else{
                                                    callback('Error in closing')
                                                }
                                            });
                                        }
                                        else{
                                            callback('Error in writing inside the file',writeerr)
                                        }
                                    })
                                }
                                else{
                                    callback('Error in deleting existing data in file',truncateerr)
                                }
                            })
                        }
                    })
                }
                else{
                    callback('Unable to open file for updating',openerr)
                }
            }
        })
    }
    else{
        callback('Check the file directory and file name')
    }     
}


//delete a file - if the file path is present then it will delete
//              - if the file path is not present then it will return err

lib.delete =(dirName,fileName,callback)=>{
    const subFolderPath = path.join(lib.baseDir, dirName);
    const filePath = path.join(subFolderPath, `${fileName}.json`);
    if(fs.existsSync(filePath)){
        fs.unlink(filePath,(unlinkerr)=>{
            if(!unlinkerr){
                callback('Succesfully deleted your file and the folder')
            }
            else{
                callback('There is an error in unlink or delete the file',unlinkerr)
            }
        })
    }
    else{
        callback('Your entered file path is not available')
    }
}


// Export the module
module.exports = lib;
