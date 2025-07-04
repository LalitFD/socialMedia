import express from "express";


import { auth } from "../middlewares/auth.js"; 
import { register,login,logOut,userVerified,userProfile} from "../controller/user.controller.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logOut);

// Email Verification
router.post("/verification", userVerified);

// Profile (protected route)
router.get("/profile", auth, userProfile);

export default router;
