const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  listUsersAdmin,
  updateUserRoleOrStatus,
  deleteUserAdmin,
  listAllPredictionsAdmin,
} = require('../controllers/adminController');
const {
  listContactsAdmin,
  updateContactStatusAdmin,
  deleteContactAdmin,
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/overview', getAdminOverview);
router.get('/users', listUsersAdmin);
router.patch('/users/:id', updateUserRoleOrStatus);
router.delete('/users/:id', deleteUserAdmin);
router.get('/predictions', listAllPredictionsAdmin);
router.get('/contacts', listContactsAdmin);
router.patch('/contacts/:id', updateContactStatusAdmin);
router.delete('/contacts/:id', deleteContactAdmin);

module.exports = router;
