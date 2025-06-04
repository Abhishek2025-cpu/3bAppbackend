// controllers/otpController.js
const axios = require('axios');
const Otp = require('../models/Otp');
const User = require('../models/User');

const API_KEY = 'ed737417-3faa-11f0-a562-0200cd936042';
const sendWelcomeEmail = require('../utils/sendWelcomeEmail');

// Step 1: Send OTP


exports.sendOtp = async (req, res) => {
  const { number } = req.body;

  try {
    const otpRes = await axios.get(
      `https://2factor.in/API/V1/ed737417-3faa-11f0-a562-0200cd936042/SMS/${number}/AUTOGEN`
    );

    if (otpRes.data.Status === 'Success') {
      res.status(200).json({
        message: 'OTP sent via SMS',
        sessionId: otpRes.data.Details
      });
    } else {
      res.status(400).json({ message: 'Failed to send OTP', details: otpRes.data });
    }
  } catch (error) {
    res.status(500).json({ message: 'SMS OTP error', error: error.message });
  }
};


// Step 2: Verify OTP
// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  const { sessionId, otp, email } = req.body;

  if (!sessionId || !otp || !email) {
    return res.status(400).json({
      status: false,
      message: 'sessionId, otp, and email are required'
    });
  }

  try {
    const verifyRes = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (verifyRes.data.Status === 'Success' && verifyRes.data.Details === 'OTP Matched') {
      // ✅ OTP matched – send welcome email
      await sendWelcomeEmail(email);

      return res.status(200).json({
        status: true,
        message: 'OTP verified and Welcome email sent'
      });
    } else {
      return res.status(400).json({
        status: false,
        message: 'Invalid OTP',
        details: verifyRes.data
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'OTP verification or email error',
      error: error.message
    });
  }
};

