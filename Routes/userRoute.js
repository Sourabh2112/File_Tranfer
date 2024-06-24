const express = require('express');
const homepage = require('../Controllers/userController')

const userRouter = express.Router();

userRouter.get("/", homepage);
userRouter.get("/Register",);
userRouter.post("/Register", );

module.exports = userRouter;