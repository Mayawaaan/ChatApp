import nodemailer from "nodemailer";

export const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
};

export const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  if (!isEmailConfigured()) {
    throw new Error("EMAIL_SERVICE_UNAVAILABLE");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Relia" <${fromAddress}>`,
    to,
    subject: "Reset your Relia password",
    text: `Hello ${fullName || "there"},\n\nWe received a request to reset your Relia password. Open the link below to choose a new password (valid for 15 minutes):\n\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Reset your Relia password</h2>
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
          Hello ${fullName ? fullName.replace(/[<>&"']/g, "") : "there"},
        </p>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
          We received a request to reset your password. Use the button below to set a new password. This link expires in 15 minutes and can only be used once.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 22px; border-radius: 8px;">
          Reset password
        </a>
        <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
          If you did not request this, you can safely ignore this message.
        </p>
      </div>
    `,
  });
};
