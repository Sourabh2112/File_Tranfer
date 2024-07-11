// const { response } = require('express');
const users = require('../model/userModel');
var bcrypt = require("bcrypt");

const homepage = (req, res) => {
    res.render("index",{
      "request":req
    });
}

const Registerpage = (req,res) =>{
  res.render("Register", {
    "request": req
  });
}

const Register = async (request,result) =>{

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

const Loginpage = (req,res) =>{
  res.render("Login", {
    "request" : req
  });
}

const Login = async (request, result) =>{
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

const Logout = (req,res) =>{
  req.session.destroy();
  res.redirect("/");
}

const MyUploads = async (request, result) =>{
  if (request.session.user) {

    var user = await users.findOne({
        "_id": ObjectId(request.session.user._id)
    });

    var uploaded = user.uploaded;

    result.render("MyUploads", {
        "request": request,
        "uploaded": uploaded
    });
    return false;
}

result.redirect("/Login");
}

module.exports = {homepage, Register, Registerpage, Loginpage, Login, Logout, MyUploads};