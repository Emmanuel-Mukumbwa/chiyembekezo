const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Import admin controllers
const userController = require('../controllers/admin/userController');
const professionalController = require('../controllers/admin/professionalController');
const volunteerController = require('../controllers/admin/volunteerController');
const organizationController = require('../controllers/admin/organizationController');
const articleController = require('../controllers/admin/articleController');
const resourceController = require('../controllers/admin/resourceController');
const appointmentController = require('../controllers/admin/appointmentController');
const communityController = require('../controllers/admin/communityController');
const analyticsController = require('../controllers/admin/analyticsController');

// Apply authentication and admin check to ALL routes
router.use(auth, isAdmin);

// ===== Users =====
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUserStatus);
router.delete('/users/:id', userController.deleteUser);

// ===== Professionals =====
router.get('/professionals', professionalController.getProfessionals);
router.put('/professionals/:id/verify', professionalController.verifyProfessional);

// ===== Volunteers =====
router.get('/volunteers', volunteerController.getVolunteers);
router.put('/volunteers/:id/verify', volunteerController.verifyVolunteer);
router.delete('/volunteers/:id', volunteerController.deleteVolunteer);

// ===== Organizations =====
router.get('/organizations', organizationController.getOrganizations);
router.post('/organizations', organizationController.createOrganization);
router.post('/organizations/:orgId/members', organizationController.addMember);
router.delete('/organizations/:orgId/members/:userId', organizationController.removeMember);

// ===== Articles =====
router.get('/articles', articleController.getArticles);
router.put('/articles/:id/publish', articleController.publishArticle);
router.delete('/articles/:id', articleController.deleteArticle);

// ===== Resources =====
router.get('/resources', resourceController.getResources);
router.put('/resources/:id/publish', resourceController.publishResource);
router.delete('/resources/:id', resourceController.deleteResource);

// ===== Appointments =====
router.get('/appointments', appointmentController.getAppointments);
router.put('/appointments/:id', appointmentController.updateAppointmentStatus);

// ===== Community =====
router.get('/community/posts', communityController.getPosts);
router.delete('/community/posts/:id', communityController.deletePost);
router.put('/community/posts/:id/pin', communityController.pinPost);

// ===== Analytics =====
router.get('/analytics', analyticsController.getStats);

module.exports = router;