const User = require('../models/User');

// POST /signup
exports.signup = async (req, res) => {
  const { name, number, email, address } = req.body;

  if (!name || !number || !email || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    const existingNumber = await User.findOne({ number });

    if (existingEmail || existingNumber) {
      return res.status(400).json({ message: 'User already exists with this email or number' });
    }

    const newUser = new User({
      name,
      number,
      email,
      address,
      role: 'client' // 👈 default role set here
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};


// POST /login
exports.login = async (req, res) => {
  const { email, number } = req.body;

  if (!email && !number) {
    return res.status(400).json({ message: 'Please provide either email or phone number to login' });
  }

  try {
    const user = await User.findOne(email ? { email } : { number });

    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email or number' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
