// Dependencies
const fs = require('fs');
const path = require('path');

// Module scaffolding
const lib = {};

// Base directory of the .data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Create a file if it doesn't exist
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

// Export the module
module.exports = lib;
