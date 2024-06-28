const express = require('express');
const {homepage , Register, Registerpage} = require('../Controllers/userController')

const userRouter = express.Router();

userRouter.get("/", homepage);
userRouter.get("/Register", Registerpage);
userRouter.post("/Register", Register);

module.exports = userRouter;