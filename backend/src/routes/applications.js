const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const applicationController = require('../controllers/applicationController');

// Submit application – accepts multiple documents
router.post(
  '/',
  auth,
  uploadFields([{ name: 'documents', maxCount: 5 }]),
  applicationController.submitApplication
);

router.get('/my', auth, applicationController.getMyApplications);

module.exports = router;
