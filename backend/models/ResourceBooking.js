const mongoose = require('mongoose');

const BOOKING_STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const resourceBookingSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Compound index for efficient overlap queries
// ---------------------------------------------------------------------------
resourceBookingSchema.index({ asset: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('ResourceBooking', resourceBookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
