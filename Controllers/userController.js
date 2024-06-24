const user = require('../model/userModel');

const homepage = (req, res) => {
    res.render("index",{
      "request":req
    });
}

module.exports = homepage;