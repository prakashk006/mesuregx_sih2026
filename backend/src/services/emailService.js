const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize SMTP transporter:', err.message);
  }
}

async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`[EMAIL DISPATCH] Email service not configured. Notification stored in application.`);
    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MESUREGX <no-reply@mesuregx.gov.in>',
      to,
      subject,
      text,
      html: html || text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email sending error (falling back):', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendEmail,
};
