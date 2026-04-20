const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  getDestinations,
  getFeaturedPackages,
} = require('../controllers/packageController');

// GET /api/packages/featured
router.get('/featured', getFeaturedPackages);

// GET /api/packages
router.get('/', getAllPackages);

// GET /api/destinations
router.get('/destinations', getDestinations);

// GET /api/packages/:id
router.get('/:id', getPackageById);

module.exports = router;
