import nodemailer from "nodemailer";
import { ENV } from "../config/env";

const sendVerificationEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.MAIL_USER,
      pass: ENV.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `Your App ${ENV.MAIL_USER}`,
    to: email,
    subject: "Verify your email",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
  });
};

export { sendVerificationEmail };
