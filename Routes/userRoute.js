const express = require('express');
const {homepage , Register} = require('../Controllers/userController')

const userRouter = express.Router();

userRouter.get("/", homepage);
userRouter.get("/Register", Register);
userRouter.post("/Register");

module.exports = userRouter;