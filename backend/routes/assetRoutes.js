const router = require('express').Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validators');

// All asset routes require authentication
router.use(authMiddleware);

// Read — any authenticated user
router.get('/', assetController.listAssets);
router.get('/:id', assetController.getAsset);
router.get('/:id/history', assetController.getAssetHistory);

// Write — Admin or Asset Manager
router.post('/', roleMiddleware('Admin', 'AssetManager'), validate(schemas.createAsset), assetController.createAsset);
router.put('/:id', roleMiddleware('Admin', 'AssetManager'), validate(schemas.updateAsset), assetController.updateAsset);
router.delete('/:id', roleMiddleware('Admin', 'AssetManager'), assetController.deleteAsset);

module.exports = router;
