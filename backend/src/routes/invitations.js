const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

router.get('/validate', invitationController.validateInvitation);
router.post('/accept', invitationController.acceptInvitation);

module.exports = router;