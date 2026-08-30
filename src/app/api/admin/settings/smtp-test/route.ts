import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, user, pass, secure, fromEmail, fromName, testRecipient } = body;

    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { success: false, error: "Host, Port, User, and Password are required to test SMTP." },
        { status: 400 }
      );
    }

    const recipient = testRecipient || user || session.user?.email || "test@milkytech.online";

    const transporter = nodemailer.createTransport({
      host: host.trim(),
      port: parseInt(port, 10) || 587,
      secure: secure === true || secure === "true" || parseInt(port, 10) === 465,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send sample test email
    await transporter.sendMail({
      from: `"${fromName || 'MilkyTech'}" <${fromEmail || user}>`,
      to: recipient,
      subject: "🚀 MilkyTech SMTP Test Notification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #10b981; margin-top: 0;">SMTP Connected Successfully!</h2>
          <p style="color: #475569; line-height: 1.6;">
            This is a test notification confirming that your SMTP email server settings are valid and working properly.
          </p>
          <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #64748b; margin-top: 16px;">
            <p style="margin: 0;"><b>SMTP Host:</b> ${host}:${port}</p>
            <p style="margin: 4px 0 0 0;"><b>Sender:</b> ${fromEmail || user}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipient}! Check your inbox.`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/settings/smtp-test error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to connect to SMTP server" },
      { status: 400 }
    );
  }
}
