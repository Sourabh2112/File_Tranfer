const express = require('express');
const { homepage, Register, Registerpage, Loginpage, Login, Logout, ViewMyUploads, UploadFile, DeleteFile, DownloadFile, ShareViaLink, DownloadLink, MySharedLinks, DelteLink, search } = require('../Controllers/userController')

const userRouter = express.Router();

// GET request
userRouter.get("/", homepage);
userRouter.get("/Register", Registerpage);
userRouter.get("/Login", Loginpage);
userRouter.get("/MyUploads", ViewMyUploads);
userRouter.get("/search", search)
userRouter.get("/SharedViaLink/:hash", DownloadLink);
userRouter.get("/MySharedLinks", MySharedLinks);
userRouter.get("/Logout", Logout);

// POST request
userRouter.post("/Register", Register);
userRouter.post("/Login", Login);
userRouter.post("/UploadFile", UploadFile);
userRouter.post("/DownloadFile", DownloadFile);
userRouter.post("/DeleteFile", DeleteFile);
userRouter.post("/ShareViaLink", ShareViaLink);
userRouter.post("/DeleteLink", DelteLink);

module.exports = userRouter;