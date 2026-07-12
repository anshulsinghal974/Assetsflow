const mongoose = require('mongoose');

const ALLOCATION_STATUSES = ['Active', 'Returned', 'Overdue'];

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allocatedDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    conditionCheckIn: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
      default: null,
    },
    status: {
      type: String,
      enum: ALLOCATION_STATUSES,
      default: 'Active',
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Partial unique index — at most one Active allocation per asset.
// This is a safety-net in addition to the application-level check in the
// controller. Mongo will reject a second Active allocation on the same asset
// even if a race condition slips past the application-level query.
// ---------------------------------------------------------------------------
allocationSchema.index(
  { asset: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } }
);

module.exports = mongoose.model('Allocation', allocationSchema);
module.exports.ALLOCATION_STATUSES = ALLOCATION_STATUSES;
