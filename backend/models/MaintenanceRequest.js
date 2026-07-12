const mongoose = require('mongoose');

const MAINTENANCE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Resolved'];

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    photoUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: MAINTENANCE_STATUSES,
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
module.exports.MAINTENANCE_STATUSES = MAINTENANCE_STATUSES;
