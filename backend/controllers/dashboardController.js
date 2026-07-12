const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const ResourceBooking = require('../models/ResourceBooking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// GET /api/dashboard/kpis — Aggregated counts for the dashboard
//
// Returns:
//   - availableAssets       → Assets with status 'Available'
//   - allocatedAssets       → Assets with status 'Allocated'
//   - maintenanceToday      → Maintenance requests created or approved today
//   - activeBookings        → Bookings with status 'Upcoming' or 'Ongoing'
//   - pendingTransfers      → Transfer requests with status 'Requested'
//   - upcomingReturns       → Active allocations with expectedReturnDate in the future
// ---------------------------------------------------------------------------
exports.getKPIs = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    availableAssets,
    allocatedAssets,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
  ] = await Promise.all([
    Asset.countDocuments({ status: 'Available' }),
    Asset.countDocuments({ status: 'Allocated' }),
    MaintenanceRequest.countDocuments({
      status: { $in: ['Pending', 'Approved'] },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),
    ResourceBooking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
    TransferRequest.countDocuments({ status: 'Requested' }),
    Allocation.countDocuments({
      status: 'Active',
      expectedReturnDate: { $gte: new Date() },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
    },
  });
});
