const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isOrgAdmin = require('../middleware/isOrgAdmin');
const organizationController = require('../controllers/organizationController');

router.use(auth, isOrgAdmin);
router.get('/me', organizationController.getOrganizationInfo);
router.get('/stats', organizationController.getStats);

module.exports = router;