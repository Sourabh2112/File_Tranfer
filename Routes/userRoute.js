const express = require('express');
const { homepage, Register, Registerpage, Loginpage, Login, Logout, ViewMyUploads, UploadFile, DeleteFile, DownloadFile } = require('../Controllers/userController')

const userRouter = express.Router();

userRouter.get("/", homepage);
userRouter.get("/Register", Registerpage);
userRouter.post("/Register", Register);
userRouter.get("/Login", Loginpage);
userRouter.post("/Login", Login);
userRouter.get("/Logout", Logout);
userRouter.get("/MyUploads", ViewMyUploads);
userRouter.post("/UploadFile", UploadFile)
userRouter.post("/DeleteFile", DeleteFile)
userRouter.post("/DownloadFile", DownloadFile)

module.exports = userRouter;