const express = require('express');
const router = express.Router();
const peerSupportController = require('../controllers/peerSupportController');
const auth = require('../middleware/auth');

router.get('/listeners', peerSupportController.getAvailableListeners);
router.post('/request', auth, peerSupportController.createRequest);
router.get('/requests', auth, peerSupportController.getMyRequests);
router.get('/volunteer/requests', auth, peerSupportController.getVolunteerRequests);
router.get('/available', auth, peerSupportController.getAvailableRequests);
router.post('/requests/:id/claim', auth, peerSupportController.claimRequest);

module.exports = router;