import nodemailer from "nodemailer";
import { db } from "./db";

export async function getTransporter() {
  const settings = await db.setting.findMany({
    where: {
      key: {
        in: [
          "smtp_host",
          "smtp_port",
          "smtp_user",
          "smtp_pass",
          "smtp_secure",
          "smtp_from_email",
          "smtp_from_name",
        ],
      },
    },
  });

  const config: Record<string, string> = {};
  settings.forEach((s) => {
    config[s.key] = s.value;
  });

  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    console.warn("SMTP is not fully configured in settings.");
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port || "587"),
    secure: config.smtp_secure === "true",
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const transporter = await getTransporter();
    if (!transporter) throw new Error("Email transporter not configured");

    const settings = await db.setting.findMany({
      where: {
        key: { in: ["smtp_from_email", "smtp_from_name"] },
      },
    });

    const fromEmail = settings.find((s) => s.key === "smtp_from_email")?.value || "noreply@example.com";
    const fromName = settings.find((s) => s.key === "smtp_from_name")?.value || "MilkyTech.Online";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: `Your Verification Code: ${otp}`,
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #3b82f6; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your verification code for MilkyTech.Online is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} MilkyTech.Online. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendOrderNotificationEmail(email: string, orderDetails: any) {
  const { id, title, amount, status } = orderDetails;
  
  const statusColor = status === 'completed' ? '#10b981' : status === 'approved' ? '#3b82f6' : '#f59e0b';

  return sendEmail({
    to: email,
    subject: `Order Update: ${title} (#${id.substring(0, 8)})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #1f2937;">Order Status Update</h2>
        <p style="font-size: 16px; color: #333;">Your order status has been updated to <strong style="color: ${statusColor};">${status.toUpperCase()}</strong>.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Service:</strong> ${title}</p>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${id}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        </div>
        <p style="font-size: 16px; color: #333;">You can view more details in your dashboard.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
      </div>
    `,
  });
}
export async function sendPasswordResetEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: `Password Reset Code: ${otp}`,
    text: `Your password reset code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #ef4444; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Use the following code to proceed:</p>
        <div style="background-color: #fef2f2; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #b91c1c;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} MilkyTech.Online. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendBroadcastEmail(email: string, message: string) {
  return sendEmail({
    to: email,
    subject: `Important Update from MilkyTech`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #3b82f6; margin: 0;">MilkyTech.Online</h2>
        </div>
        <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; font-size: 16px; color: #333; line-height: 1.6;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} MilkyTech.Online. All rights reserved.</p>
      </div>
    `,
  });
}
