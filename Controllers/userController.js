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

module.exports = {homepage, Register, Registerpage};