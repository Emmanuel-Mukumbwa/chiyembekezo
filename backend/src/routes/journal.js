const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const auth = require('../middleware/auth');

// All routes are protected (require login)
router.get('/', auth, journalController.getEntries);
router.post('/', auth, journalController.createEntry);
router.put('/:id', auth, journalController.updateEntry);
router.delete('/:id', auth, journalController.deleteEntry);

module.exports = router;