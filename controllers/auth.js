const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: passwordHash });
    return res.status(201).json({ message: 'User created.', userId: user.id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    throw error;
  }
};

exports.login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = jwt.sign(
    { email: user.email, userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h', issuer: 'social-feed-api', audience: 'social-feed-client' }
  );
  return res.status(200).json({ token, userId: user.id });
};

exports.getUserStatus = async (req, res) => {
  const user = await User.findById(req.userId).select('status');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.status(200).json({ status: user.status });
};

exports.updateUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { status: req.body.status.trim() },
    { new: true, runValidators: true, select: 'status' }
  );
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.status(200).json({ message: 'User updated.', status: user.status });
};
