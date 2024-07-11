const express = require('express');
const {homepage , Register, Registerpage, Loginpage, Login, Logout, ViewMyUploads, UploadFile} = require('../Controllers/userController')

const userRouter = express.Router();

userRouter.get("/", homepage);
userRouter.get("/Register", Registerpage);
userRouter.post("/Register", Register);
userRouter.get("/Login", Loginpage);
userRouter.post("/Login", Login);
userRouter.get("/Logout", Logout);
userRouter.get("/MyUploads", ViewMyUploads);
userRouter.post("/UploadFile", UploadFile)

module.exports = userRouter;