const express = require('express');
const router = express.Router();
const safetyPlanController = require('../controllers/safetyPlanController');
const auth = require('../middleware/auth');

router.get('/', auth, safetyPlanController.getSafetyPlan);
router.post('/', auth, safetyPlanController.saveSafetyPlan);

module.exports = router;