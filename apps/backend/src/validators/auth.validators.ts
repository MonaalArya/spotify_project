import { z } from "zod";

const signUpSchema = z.object({
  user_name: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const verificationBodySchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string(),
});

const resendVerificationBodySchema = z.object({
  email: z.email("Invalid email address"),
});

export { signUpSchema, verificationBodySchema, resendVerificationBodySchema };
