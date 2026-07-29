const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isOrgAdmin = require('../middleware/isOrgAdmin');
const resourceController = require('../controllers/organization/resourceController');

router.use(auth, isOrgAdmin);

router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', resourceController.createResource);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
