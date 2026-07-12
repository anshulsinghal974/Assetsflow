const AssetCategory = require('../models/AssetCategory');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------------------------------------------------------------------
// POST /api/categories
// ---------------------------------------------------------------------------
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// ---------------------------------------------------------------------------
// GET /api/categories
// ---------------------------------------------------------------------------
exports.listCategories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };

  const categories = await AssetCategory.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

// ---------------------------------------------------------------------------
// GET /api/categories/:id
// ---------------------------------------------------------------------------
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  res.status(200).json({ success: true, data: category });
});

// ---------------------------------------------------------------------------
// PUT /api/categories/:id
// ---------------------------------------------------------------------------
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  res.status(200).json({ success: true, data: category });
});

// ---------------------------------------------------------------------------
// DELETE /api/categories/:id
// ---------------------------------------------------------------------------
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  res.status(200).json({ success: true, message: 'Category deleted.' });
});
