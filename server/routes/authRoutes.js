import express from "express";
import { registerUser, loginUser, googleCallbackController, updateProfileAndLoginController } from "../controllers/authController.js";
import passport from "passport";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleCallbackController);
router.post("/updateProfileAndLogin",verifyToken, updateProfileAndLoginController)

router.post("/register", registerUser);
router.post("/login", loginUser);


export default router;
