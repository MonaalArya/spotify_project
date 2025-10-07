import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import {
  signUpSchema,
  verificationBodySchema,
  resendVerificationBodySchema,
} from "../validators/auth.validators";
import { redis_client } from "../utils/redis-client";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dns from "dns/promises";
import { ZodError } from "zod";
import { error } from "console";
import { sendVerificationEmail } from "../utils/email";

const prisma = new PrismaClient();

const signUpUser = async (req: Request, res: Response) => {
  try {
    const parsed = signUpSchema.parse(req.body);

    // check domain validity
    const domain = parsed.email.split("@")[1];
    try {
      const records = await dns.resolveMx(domain);

      if (!records.length) {
        return res.status(400).json({
          message: "Email domain cannot receive emails",
        });
      }
    } catch (err) {
      console.error("DNS resolution error:", error);
      return res.status(400).json({
        message: "Domain does not exist",
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { user_name: parsed.user_name },
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    const password_hash = await bcrypt.hash(parsed.password, 10);

    const newUser = await prisma.user.create({
      data: {
        user_name: parsed.user_name,
        email: parsed.email,
        password_hash,
        followers: 0,
        following: 0,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis_client.set(`otp:${parsed.email}`, otp, { EX: 300 });

    try {
      await sendVerificationEmail(parsed.email, otp);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message: "User created successfullly",
      user: newUser,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join(",");
      return res.status(400).json({
        message: "Invalid input",
        errors: errorMessages,
      });
    }
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const parsed = verificationBodySchema.parse(req.body);

    const storedUser = await prisma.user.findUnique({
      where: {
        email: parsed.email,
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (storedUser.is_verified) {
      return res.status(200).json({ message: "User already verified" });
    }

    const storedOtp = await redis_client.get(`otp:${parsed.email}`);

    if (!storedOtp) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (storedOtp !== parsed.otp) {
      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    await prisma.user.update({
      where: { user_id: storedUser.user_id },
      data: {
        is_verified: true,
      },
    });

    console.log(`✅ Verified email for user: ${storedUser.email}`);

    await redis_client.del(`otp:${parsed.email}`);

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join(",");
      return res.status(400).json({
        message: "Invalid input",
        errors: errorMessages,
      });
    }
    console.error("Verification function error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resendVerification = async (req: Request, res: Response) => {
  try {
    const parsed = resendVerificationBodySchema.parse(req.body);

    const storedUser = await prisma.user.findUnique({
      where: {
        email: parsed.email,
      },
    });

    if (!storedUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (storedUser?.is_verified) {
      return res.status(200).json({
        message: "User already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis_client.set(`otp:${parsed.email}`, otp, { EX: 300 });

    try {
      await sendVerificationEmail(parsed.email, otp);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join(",");
      return res.status(400).json({
        message: "Invalid input",
        errors: errorMessages,
      });
    }
    console.error("Verification mail resend error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { signUpUser, verifyEmail, resendVerification };
