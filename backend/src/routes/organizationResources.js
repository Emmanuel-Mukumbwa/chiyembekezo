const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isOrgAdmin = require('../middleware/isOrgAdmin');
const { uploadFile } = require('../middleware/upload');
const resourceController = require('../controllers/organization/resourceController');

router.use(auth, isOrgAdmin);

router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', uploadFile, resourceController.createResource);
router.put('/:id', uploadFile, resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
