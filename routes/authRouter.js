// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);
authRouter.get("/profile", authController.getProfile);
authRouter.post("/profile", authController.postProfile);
authRouter.get("/editprofile", authController.getEditProfile);
authRouter.post("/editprofile", authController.postEditProfile);

module.exports = authRouter;