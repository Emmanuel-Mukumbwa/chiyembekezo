const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

router.post('/', auth, applicationController.submitApplication);
router.get('/my', auth, applicationController.getMyApplications);

module.exports = router;