const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isOrgAdmin = require('../middleware/isOrgAdmin');
const organizationController = require('../controllers/organizationController');

// All routes require authentication and organization admin role
router.use(auth, isOrgAdmin);

// Organization info & stats
router.get('/me', organizationController.getOrganizationInfo);
router.get('/stats', organizationController.getStats);
router.get('/insights', organizationController.getInsights);

// Members management
router.get('/members', organizationController.getMembers);
router.post('/members', organizationController.addMember);
router.put('/members/:memberId', organizationController.updateMember);
router.delete('/members/:memberId', organizationController.removeMember);

module.exports = router;