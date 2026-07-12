const mongoose = require('mongoose');

/**
 * Counter model — used for atomic sequential ID generation.
 * Each document represents a named sequence (e.g., "assetTag").
 * findOneAndUpdate with $inc guarantees no duplicates under concurrency.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },   // sequence name, e.g. "assetTag"
  seq: { type: Number, default: 0 },
});

/**
 * Atomically increments the named sequence and returns the new value.
 * Creates the counter document on first call (upsert).
 * @param {string} name - Counter name (e.g. "assetTag")
 * @returns {Promise<number>} The next sequence number
 */
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
