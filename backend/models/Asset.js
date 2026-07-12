const mongoose = require('mongoose');
const Counter = require('./Counter');

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'UnderMaintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      unique: true,
      // Not required at schema level — generated in pre-save hook
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Category is required'],
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
    },
    qrCode: {
      type: String,
      default: null,
    },
    acquisitionDate: {
      type: Date,
      default: null,
    },
    acquisitionCost: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
      default: 'New',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: 'Available',
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    documentUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ status: 1 });

// ---------------------------------------------------------------------------
// Pre-save hook — atomically generate sequential asset tag on creation
// Uses Counter model to guarantee uniqueness under concurrent inserts.
// ---------------------------------------------------------------------------
assetSchema.pre('save', async function (next) {
  if (this.isNew && !this.assetTag) {
    const seq = await Counter.getNextSequence('assetTag');
    this.assetTag = `AF-${String(seq).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_STATUSES = ASSET_STATUSES;
