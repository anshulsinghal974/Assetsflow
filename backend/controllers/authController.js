const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// Helper — issue JWT and set httpOnly cookie
// ---------------------------------------------------------------------------
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Strip sensitive fields from response
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.resetToken;
  delete userObj.resetTokenExpiry;

  res.status(statusCode).json({ success: true, data: { user: userObj, token } });
};

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  // Rule #5 — always create as Employee, ignore any role in body
  const user = new User({ name, email, department: department || null });
  user.password = password; // triggers virtual setter → hashed in pre-save
  await user.save();

  sendToken(user, 201, res);
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select passwordHash (excluded by default)
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.status !== 'Active') {
    return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
  }

  sendToken(user, 200, res);
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
exports.logout = asyncHandler(async (_req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password  (stubbed — no real email service)
// ---------------------------------------------------------------------------
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists — always return success
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  }

  // Generate a random reset token, store hashed version
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // In production this would be emailed — for MVP we log & return it
  console.log(`[STUB] Password reset token for ${email}: ${resetToken}`);

  res.status(200).json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
    // Include token in response for MVP testing — remove in production
    resetToken,
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me — return current authenticated user
// ---------------------------------------------------------------------------
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department');
  res.status(200).json({ success: true, data: user });
});
