// utils/sendWelcomeEmail.js
const transporter = require('./mailer');

const sendWelcomeEmail = async (to, name = 'User') => {
  const mailOptions = {
    from: `"3B Profiles App" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Welcome to 3B Profiles!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Welcome to <span style="color: #007bff;">ThreeB</span>, ${name}!</h2>
          <p>Thank you for verifying your mobile number and email address.</p>
          <p>We're excited to have you on board. You can now start exploring all the features we offer.</p>
          <hr />
          <p style="font-size: 14px; color: #888;">If you did not sign up for this account, please ignore this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
