import { Router } from "express";
import {
  signUpUser,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controllers";

const router = Router();

router.post("/signup", signUpUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
