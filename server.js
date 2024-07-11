const express = require("express");
const http = require("http");
var bcrypt = require("bcrypt");
// var nodemailer = require("nodemailer");
const mongoose = require('mongoose');
// const users = require('./model/userModel.js');
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
var nodemailerObject = {
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
app.use("/public/img", express.static(__dirname + "/public/img"));
app.use("/public/font-awesome-4.7.0", express.static(__dirname + "/public/font-awesome-4.7.0"));
app.use("/public/fonts", express.static(__dirname + "/public/fonts"));

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


mongoose
  .connect(
    "mongodb://localhost:27017/file_transfer"
  )
  .then(() => server.listen(3000))
  .then(() =>
    console.log("connected to the detabase and listening to localhost 3000")
  )
  .catch((err) => console.log(err));
