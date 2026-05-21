import nodemailer from 'nodemailer'

/**
 * Creates a reusable test email transporter.
 * Ethereal is a free fake SMTP service for testing. It catches all emails and generates a link to view them.
 */
export async function getEmailTransporter() {
  // If you configure real SMTP credentials in your .env later, use them here.
  // For now, we dynamically generate a testing account if none exist.
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
  const transporter = await getEmailTransporter();

  const info = await transporter.sendMail({
    from: '"SaaS RBAC Starter" <noreply@saasstarter.dev>',
    to: toEmail,
    subject: "Reset your password",
    text: `You requested a password reset. Click this link to choose a new password: ${resetLink}`,
    html: `
      <div style="font-family: sans-serif; max-w-md; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        <br/><br/>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:<br/>${resetLink}</p>
      </div>
    `,
  });

  console.log("-----------------------------------------");
  console.log("Mock Email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  console.log("-----------------------------------------");

  return nodemailer.getTestMessageUrl(info);
}
