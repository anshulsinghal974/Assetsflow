const mongoose = require('mongoose');
const ResourceBooking = require('../models/ResourceBooking');
const Asset = require('../models/Asset');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// Helper — check for overlapping bookings on an asset
//
// *** RULE #2 — No overlapping bookings ***
// Overlap condition: newStart < existingEnd AND newEnd > existingStart
// Back-to-back is allowed: (9-10 then 10-11) → 10 < 10 is false → no overlap ✓
//
// Optionally excludes a specific booking (for reschedule operations).
// ---------------------------------------------------------------------------
async function hasOverlap(assetId, startTime, endTime, excludeBookingId = null, session = null) {
  const filter = {
    asset: assetId,
    status: { $ne: 'Cancelled' },
    startTime: { $lt: endTime },   // existing start < new end
    endTime: { $gt: startTime },   // existing end > new start
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const query = ResourceBooking.findOne(filter);
  if (session) query.session(session);
  return query;
}

// ---------------------------------------------------------------------------
// POST /api/bookings — Create a booking with atomic overlap check
// ---------------------------------------------------------------------------
exports.createBooking = asyncHandler(async (req, res) => {
  const { asset: assetId, startTime, endTime } = req.body;

  // Verify asset exists and is bookable
  const asset = await Asset.findById(assetId);
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
  if (!asset.isBookable) {
    return res.status(400).json({ success: false, message: 'This asset is not bookable.' });
  }

  // --- Atomic overlap check (transaction) ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const overlap = await hasOverlap(assetId, new Date(startTime), new Date(endTime), null, session);

    if (overlap) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'Booking conflict: time slot overlaps with an existing booking.',
        conflictWith: {
          _id: overlap._id,
          startTime: overlap.startTime,
          endTime: overlap.endTime,
        },
      });
    }

    const [booking] = await ResourceBooking.create(
      [{
        asset: assetId,
        bookedBy: req.user._id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await ResourceBooking.findById(booking._id)
      .populate('asset', 'assetTag name')
      .populate('bookedBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/bookings/:id/cancel
// ---------------------------------------------------------------------------
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await ResourceBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  if (booking.status === 'Cancelled') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
  }
  if (booking.status === 'Completed') {
    return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking.' });
  }

  booking.status = 'Cancelled';
  await booking.save();

  res.status(200).json({ success: true, data: booking });
});

// ---------------------------------------------------------------------------
// PATCH /api/bookings/:id/reschedule — change time, re-check overlap
// ---------------------------------------------------------------------------
exports.rescheduleBooking = asyncHandler(async (req, res) => {
  const { startTime, endTime } = req.body;

  const booking = await ResourceBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  if (booking.status === 'Cancelled' || booking.status === 'Completed') {
    return res.status(400).json({ success: false, message: `Cannot reschedule a ${booking.status} booking.` });
  }

  // Overlap check excluding the current booking
  const overlap = await hasOverlap(
    booking.asset,
    new Date(startTime),
    new Date(endTime),
    booking._id
  );

  if (overlap) {
    return res.status(409).json({
      success: false,
      message: 'Booking conflict: new time slot overlaps with an existing booking.',
      conflictWith: {
        _id: overlap._id,
        startTime: overlap.startTime,
        endTime: overlap.endTime,
      },
    });
  }

  booking.startTime = new Date(startTime);
  booking.endTime = new Date(endTime);
  await booking.save();

  const populated = await ResourceBooking.findById(booking._id)
    .populate('asset', 'assetTag name')
    .populate('bookedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// ---------------------------------------------------------------------------
// GET /api/bookings — List bookings (filterable by asset, date range, status)
// ---------------------------------------------------------------------------
exports.listBookings = asyncHandler(async (req, res) => {
  const { asset, status, startDate, endDate, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (asset) filter.asset = asset;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    ResourceBooking.find(filter)
      .populate('asset', 'assetTag name')
      .populate('bookedBy', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ResourceBooking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});
