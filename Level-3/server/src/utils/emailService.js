const nodemailer = require('nodemailer');

const isEmailEnabled = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendAnnouncementEmail = async ({ recipients, subject, title, message }) => {
  const uniqueRecipients = [...new Set((recipients || []).filter(Boolean))];

  if (uniqueRecipients.length === 0) {
    return { status: 'skipped', sent: 0, reason: 'No recipients matched the selected audience.' };
  }

  if (!isEmailEnabled()) {
    return { status: 'skipped', sent: 0, reason: 'SMTP is not configured.' };
  }

  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: uniqueRecipients,
    subject: subject || title,
    text: `${title}\n\n${message}`,
    html: `<h2>${title}</h2><p>${message}</p>`
  });

  return { status: 'sent', sent: uniqueRecipients.length };
};

module.exports = {
  sendAnnouncementEmail
};
