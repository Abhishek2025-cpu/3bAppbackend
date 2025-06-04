// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'SendGrid' or custom SMTP
  auth: {
    user: process.env.SMTP_EMAIL, // e.g., your@gmail.com
    pass: process.env.SMTP_PASSWORD // app password or actual password
  }
});

module.exports = transporter;
