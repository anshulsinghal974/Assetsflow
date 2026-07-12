const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['Employee', 'DeptHead', 'AssetManager', 'Admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'Employee',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Pre-save hook — hash password if it was set via the virtual setter
// ---------------------------------------------------------------------------
userSchema.virtual('password').set(function (value) {
  this._plainPassword = value;
});

userSchema.pre('save', async function (next) {
  if (this._plainPassword) {
    this.passwordHash = await bcrypt.hash(this._plainPassword, 12);
  }
  next();
});

// ---------------------------------------------------------------------------
// Instance method — compare candidate password against stored hash
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
