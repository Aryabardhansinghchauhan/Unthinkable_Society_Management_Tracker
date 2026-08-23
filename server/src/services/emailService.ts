import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

export const initEmailTransporter = async () => {
  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Dev fallback: Ethereal test account or console logger
    transporter = null;
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!transporter) {
      console.log(`[Email Simulator] To: ${options.to} | Subject: "${options.subject}"`);
      console.log(`[Email Simulator] Body: ${options.text || options.html?.slice(0, 100)}...`);
      return;
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
  }
};
