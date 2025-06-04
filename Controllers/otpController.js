// controllers/otpController.js
const axios = require('axios');
const Otp = require('../models/Otp');
const User = require('../models/User');

const API_KEY = 'ed737417-3faa-11f0-a562-0200cd936042';

// Step 1: Send OTP


exports.sendOTP = async (req, res) => {
  const { number } = req.body;

  if (!number) return res.status(400).json({ message: 'Phone number is required' });

  try {
    const response = await axios.get(`https://2factor.in/API/V1/ed737417-3faa-11f0-a562-0200cd936042/SMS/${number}/AUTOGEN`);
    
    if (response.data.Status !== 'Success') {
      return res.status(500).json({ message: 'Failed to send OTP', error: response.data.Details });
    }

    return res.status(200).json({
      message: 'OTP sent successfully via SMS',
      sessionId: response.data.Details
    });

  } catch (err) {
    return res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};


// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  const { number, otp, sessionId } = req.body;

  if (!number || !otp || !sessionId) {
    return res.status(400).json({ message: 'Missing number, OTP or session ID' });
  }

  try {
    const verifyResponse = await axios.get(`https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`);

    if (verifyResponse.data.Details === 'OTP Matched') {
      return res.status(200).json({ message: 'OTP verified successfully' });// time out 
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};
