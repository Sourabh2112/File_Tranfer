const user = require('../model/userModel');

const homepage = (req, res) => {
    res.render("index",{
      "request":req
    });
}

const Register = (req,res) =>{
  res.render("Register", {
    "request": req
  });
}

module.exports = {homepage, Register};