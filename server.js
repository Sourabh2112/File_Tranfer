const express = require("express");
const http = require("http");
var bcrypt = require("bcrypt");
// var nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const users = require('./model/userModel.js');
const userRouter = require('./Routes/userRoute.js')

const app = express();
const server = http.createServer(app);

const mainURL = "http://localhost:3000";
// const mongoURI = 'mongodb://localhost:27017/file_transfer';
// var database = null;


// var mongodb = require("mongodb");
// var mongoClient = mongodb.MongoClient;
// var ObjectId = mongodb.ObjectId;

var formidable = require("express-formidable");
app.use(formidable());

var nodemailerFrom = ("sourabhsbg01@gmail.com");
var odemailerObject = {
    services: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "sourabhsbg01@gmail.com",
        pass: ""
    }
};

app.set("view engine", "ejs");

app.use("/public/css", express.static(__dirname + "/public/css"));
app.use("/public/js", express.static(__dirname + "/public/js"));
// app.use("/public/img", express.static(__dirname + "/public/img"));
app.use("/public/font-awesome-4.7.0", express.static(__dirname + "/public/font-awesome-4.7.0"));
// app.use("/public/fonts", express.static(__dirname + "/public/fonts"));

var session = require("express-session");
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
}));

app.use(function (request, result, next) {
    request.mainURL = mainURL;
    request.isLogin = (typeof request.session.user !== "undefined");
    request.user = request.session.user;
    // continue the request
    next();
});

app.use("/", userRouter);

app.get("/Register", function (req, res) {
    res.render("Register", {
        "request": req
    });
});

app.post("/Register", async function (request, result) {

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
});

mongoose
  .connect(
    "mongodb://localhost:27017/file_transfer"
  )
  .then(() => server.listen(3000))
  .then(() =>
    console.log("connected to the detabase and listening to localhost 3000")
  )
  .catch((err) => console.log(err));
