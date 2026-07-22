const express = require('express');
const router = express.Router();
const peerSupportController = require('../controllers/peerSupportController');
const auth = require('../middleware/auth');

router.get('/listeners', peerSupportController.getAvailableListeners);
router.post('/request', auth, peerSupportController.createRequest);
router.get('/requests', auth, peerSupportController.getMyRequests);

module.exports = router;