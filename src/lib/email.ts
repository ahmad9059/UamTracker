import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

interface SendVerificationEmailParams {
  to: string;
  userName: string;
  verificationUrl: string;
}

interface SendSupportEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  accountEmail?: string | null;
}

export async function sendVerificationEmail({
  to,
  userName,
  verificationUrl,
}: SendVerificationEmailParams) {
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Verify your email address",
      html: buildVerificationEmailHtml(userName, verificationUrl),
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendSupportEmail({
  name,
  email,
  subject,
  message,
  accountEmail,
}: SendSupportEmailParams) {
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const to = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

    if (!from || !to || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP environment variables are not configured");
    }

    await getTransporter().sendMail({
      from,
      to,
      replyTo: { name, address: email },
      subject: `[UamTracker Support] ${subject}`,
      text: buildSupportEmailText({ name, email, subject, message, accountEmail }),
      html: buildSupportEmailHtml({ name, email, subject, message, accountEmail }),
    });
  } catch (error) {
    console.error("Failed to send support email:", error);
    throw new Error("Failed to send support email");
  }
}

function buildVerificationEmailHtml(name: string, url: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;">
            <tr>
              <td style="background-color:#1d4ed8;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">UamTracker</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:700;">Verify your email</h2>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                  Hi ${name || "there"},<br/><br/>
                  Thanks for creating an account. Please verify your email address by clicking the button below.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${url}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                        Verify Email Address
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
                  This link expires in 1 hour. If you did not create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">GPA Records</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildSupportEmailText({
  name,
  email,
  subject,
  message,
  accountEmail,
}: SendSupportEmailParams): string {
  return [
    "New support request from UamTracker",
    "",
    `Name: ${name}`,
    `Reply-to email: ${email}`,
    `Signed-in account: ${accountEmail || "Not available"}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

function buildSupportEmailHtml({
  name,
  email,
  subject,
  message,
  accountEmail,
}: SendSupportEmailParams): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:16px;box-shadow:0 12px 30px rgba(15,23,42,0.08);overflow:hidden;border:1px solid #dbeafe;">
            <tr>
              <td style="background-color:#155dfb;padding:28px 36px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">UamTracker</h1>
                <p style="margin:6px 0 0;color:#dbeafe;font-size:13px;">New support request</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;">
                <h2 style="margin:0 0 18px;color:#0f172a;font-size:22px;font-weight:800;">${escapeHtml(subject)}</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                  ${supportMetaRow("Name", name)}
                  ${supportMetaRow("Reply-to email", email)}
                  ${supportMetaRow("Signed-in account", accountEmail || "Not available")}
                </table>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;color:#334155;font-size:15px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(message)}</div>
                <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.5;">Reply directly to this email to respond to the user.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">GPA Records Support</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function supportMetaRow(label: string, value: string) {
  return `<tr>
    <td style="width:160px;padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
