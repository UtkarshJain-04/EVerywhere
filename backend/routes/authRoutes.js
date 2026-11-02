const express = require('express');
const {
  signup,
  login,
  getMe,
  logout,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);
router.put('/vehicle', requireAuth, updateVehicle);
router.delete('/vehicle', requireAuth, deleteVehicle);

module.exports = router;
