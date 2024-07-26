const { ObjectId } = require('mongodb');
const users = require('../model/userModel');
const PublicLink = require('../model/publicLinkMOdel');
var bcrypt = require("bcrypt");
const fileSystem = require("fs");
const mongoose = require('mongoose');

const { removeFileReturnUpdated, recursiveGetFile, recursiveSearch, recursiveSearchShared } = require('./functionController');

const mainURL = "http://localhost:3000";

const homepage = (req, res) => {
    res.render("index", {
        "request": req
    });
}

const Registerpage = (req, res) => {
    res.render("Register", {
        "request": req
    });
}

const Register = async (request, result) => {

    var name = request.fields.name;
    var email = request.fields.email;
    var password = request.fields.password;
    var reset_token = "";
    var isVerified = true;
    var verification_token = new Date().getTime();

    var user = await users.findOne({
        "email": email
    });

    if (user == null) {
        bcrypt.hash(password, 10, async function (error, hash) {
            await users.create({
                "name": name,
                "email": email,
                "password": hash,
                "reset_token": reset_token,
                "uploaded": [],
                "sharedWithMe": [],
                "isVerified": isVerified,
                "verification_token": verification_token
            })
            return result.status(200).redirect("/Register");
        });
    } else {
        request.status = "error";
        request.message = "Email already exist.";

        result.render("Register", {
            "request": request
        });
    }
}

const Loginpage = (req, res) => {
    res.render("Login", {
        "request": req
    });
}

const Login = async (request, result) => {
    var email = request.fields.email;
    var password = request.fields.password;

    var user = await users.findOne({
        "email": email
    });

    if (user == null) {
        request.status = "error";
        request.message = "Email does not exist.";
        result.render("Login", {
            "request": request
        });
        return false;
    }

    bcrypt.compare(password, user.password, function (error, isVerify) {
        if (isVerify) {
            request.session.user = user;
            result.redirect("/");

            return false;
        }

        request.status = "error";
        request.message = "Password is not correct.";
        result.render("Login", {
            "request": request
        });
    });
}

const Logout = (req, res) => {
    req.session.destroy();
    res.redirect("/");
}

const ViewMyUploads = async (request, result) => {
    if (request.session.user) {
        try {
            var user = await users.findOne({
                "_id": new ObjectId(request.session.user._id)
            });

            if (user) {
                var uploaded = user.uploaded;

                result.render("MyUploads", {
                    "request": request,
                    "uploaded": uploaded
                });
            } else {
                result.status(404).send("User not found");
            }
        } catch (error) {
            console.error("Error retrieving user data:", error);
            result.status(500).send("An error occurred while retrieving your uploads.");
        }
    } else {
        result.redirect("/Login");
    }
}

const UploadFile = async (request, result) => {
    if (request.session.user) {

        var user = await users.findOne({
            "_id": new ObjectId(request.session.user._id)
        });

        if (request.files.file.size > 0) {

            const _id = request.fields._id;

            var uploadedObj = {
                "_id": new ObjectId(),
                "size": request.files.file.size, // in bytes
                "name": request.files.file.name,
                "type": request.files.file.type,
                "filePath": "",
                "createdAt": new Date().getTime()
            };

            var filePath = "public/uploads/" + user.email + "/" + new Date().getTime() + "-" + request.files.file.name;
            uploadedObj.filePath = filePath;

            if (!fileSystem.existsSync("public/uploads/" + user.email)) {
                fileSystem.mkdirSync("public/uploads/" + user.email);
            }

            // Read the file
            fileSystem.readFile(request.files.file.path, function (err, data) {
                if (err) throw err;
                // console.log('File read!');

                // Write the file
                fileSystem.writeFile(filePath, data, async function (err) {
                    if (err) throw err;
                    // console.log('File written!');

                    await users.updateOne({
                        "_id": new ObjectId(request.session.user._id)
                    }, {
                        $push: {
                            "uploaded": uploadedObj
                        }
                    });

                    request.session.status = "success";
                    request.session.message = "Image has been uploaded. Try our premium version for image compression.";

                    result.redirect("/MyUploads/" + _id);
                });

                // Delete the file
                fileSystem.unlink(request.files.file.path, function (err) {
                    if (err) throw err;
                    // console.log('File deleted!');
                });
            });

        } else {
            request.status = "error";
            request.message = "Please select valid image.";

            result.render("MyUploads", {
                "request": request
            });
        }

        return false;
    }

    result.redirect("/Login");
}

const DeleteFile = async (request, result) => {
    const _id = request.fields._id;

    if (request.session.user) {
        var user = await users.findOne({
            "_id": new ObjectId(request.session.user._id)
        });

        var updatedArray = await removeFileReturnUpdated(user.uploaded, _id);
        for (var a = 0; a < updatedArray.length; a++) {
            updatedArray[a]._id = new ObjectId(updatedArray[a]._id);
        }

        await users.updateOne({
            "_id": new ObjectId(request.session.user._id)
        }, {
            $set: {
                "uploaded": updatedArray
            }
        });

        const backURL = request.header('Referer') || '/';
        result.redirect(backURL);
        return false;
    }

    result.redirect("/Login");
}

const DownloadFile = async (request, result) => {
    const _id = request.fields._id;

    // var link = await database.collection("public_links").findOne({
    //     "file._id": ObjectId(_id)
    // });

    // if (link != null) {
    //     fileSystem.readFile(link.file.filePath, function (error, data) {
    //         // console.log(error);

    //         result.json({
    //             "status": "success",
    //             "message": "Data has been fetched.",
    //             "arrayBuffer": data,
    //             "fileType": link.file.type,
    //             // "file": mainURL + "/" + file.filePath,
    //             "fileName": link.file.name
    //         });
    //     });
    //     return false;
    // }

    if (request.session.user) {

        var user = await users.findOne({
            "_id": new ObjectId(request.session.user._id)
        });

        var fileUploaded = await recursiveGetFile(user.uploaded, _id);

        if (fileUploaded == null) {
            result.json({
                "status": "error",
                "message": "File is neither uploaded nor shared with you."
            });
            return false;
        }

        var file = fileUploaded;

        fileSystem.readFile(file.filePath, function (error, data) {
            // console.log(error); 
            result.json({
                "status": "success",
                "message": "Data has been fetched.",
                "arrayBuffer": data,
                "fileType": file.type,
                // "file": mainURL + "/" + file.filePath,
                "fileName": file.name
            });
        });
        return false;
    }

    result.json({
        "status": "error",
        "message": "Please login to perform this action."
    });
    return false;
}

const ShareViaLink = async (request, result) => {
    const _id = request.fields._id;

    if (request.session.user) {
        var user = await users.findOne({
            "_id": new ObjectId(request.session.user._id)
        });
        var file = await recursiveGetFile(user.uploaded, _id);

        if (file == null) {
            request.session.status = "error";
            request.session.message = "File does not exists";

            const backURL = request.header("Referer") || "/";

            result.redirect(backURL);
            return false;
        }


        bcrypt.hash(file.name, 10, async function (error, hash) {
            hash = hash.substring(10, 20);
            const link = mainURL + "/SharedViaLink/" + hash;
            await PublicLink.create({
                "hash": hash,
                "file": file,
                "uploadedBy": {
                    "_id": user._id,
                    "name": user.name,
                    "email": user.email
                },
                "createdAt": new Date().getTime()
            });

            request.session.status = "success";
            request.session.message = "Share link: " + link;

            const backURL = request.header("Referer") || "/";
            result.redirect(backURL);
        });

        return false;
    }

    result.redirect("/Login");
}

const DownloadLink = async (request, result) => {
    const hash = request.params.hash;

    var link = await PublicLink.findOne({
        "hash": hash
    });

    if (link == null) {
        request.session.status = "error";
        request.session.message = "Link expired.";

        result.render("SharedViaLink", {
            "request": request
        });
        return false;
    }

    result.render("SharedViaLink", {
        "request": request,
        "link": link
    });
}

const DelteLink = async function (request, result) {
    const _id = request.fields._id;

    if (request.session.user) {
        var link = await PublicLink.findOne({
            $and: [{
                "uploadedBy._id": new ObjectId(request.session.user._id)
            }, {
                "_id": new ObjectId(_id)
            }]
        });

        if (link == null) {
            request.session.status = "error";
            request.session.message = "Link does not exists.";

            const backURL = request.header("Referer") || "/";
            result.redirect(backURL);
            return false;
        }

        await PublicLink.deleteOne({
            $and: [{
                "uploadedBy._id": new ObjectId(request.session.user._id)
            }, {
                "_id": new ObjectId(_id)
            }]
        });

        request.session.status = "success";
        request.session.message = "Link has been deleted.";

        const backURL = request.header("Referer") || "/";
        result.redirect(backURL);
        return false;
    }

    result.redirect("/Login");
};

const MySharedLinks = async function (request, result) {
    if (request.session.user) {
        try {
            const links = await PublicLink.find({
                "uploadedBy._id": request.session.user._id
            }).exec();

            result.render("MySharedLinks", {
                "request": request,
                "links": links
            });
        } catch (error) {
            console.error("Error fetching links:", error);
            result.status(500).send("An error occurred while fetching shared links.");
        }
        return;
    }

    result.redirect("/Login");
};

const search = async function (request, result) {
    const search = request.query.search;

    if (request.session.user) {
        var user = await users.findOne({
            "_id": new ObjectId(request.session.user._id)
        });
        
        var fileUploaded = await recursiveSearch(user.uploaded, search);
        var fileShared = await recursiveSearchShared(user.sharedWithMe, search);

        // check if file is uploaded or shared with user
        if (fileUploaded == null && fileShared == null) {
            request.status = "error";
            request.message = "File/folder '" + search + "' is neither uploaded nor shared with you.";

            result.render("Search", {
                "request": request
            });
            return false;
        }

        var file = (fileUploaded == null) ? fileShared : fileUploaded;
        file.isShared = (fileUploaded == null);
        result.render("Search", {
            "request": request,
            "file": file
        });

        return false;
    }

    result.redirect("/Login");
}

module.exports = { homepage, Register, Registerpage, Loginpage, Login, Logout, ViewMyUploads, UploadFile, DeleteFile, DownloadFile, ShareViaLink, DownloadLink, MySharedLinks, DelteLink, search };