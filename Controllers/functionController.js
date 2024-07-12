const fs = require('fs');
const { ObjectId } = require('mongodb'); 

function removeFileReturnUpdated(arr, _id) {
    for (var a = 0; a < arr.length; a++) {
        if (arr[a].type != "folder" && arr[a]._id == _id) {
            // remove the file from uploads folder
            try {
                fs.unlinkSync(arr[a].filePath);
            } catch (exp) {
                console.log(exp);
            }
            // remove the file from array
            arr.splice(a, 1);
            break;
        }
        // do the recursion if it has sub-folders
        if (arr[a].type == "folder" && arr[a].files.length > 0) {
            arr[a]._id = ObjectId(arr[a]._id);
            removeFileReturnUpdated(arr[a].files, _id);
        }
    }

    return arr;
}

module.exports = { removeFileReturnUpdated };
