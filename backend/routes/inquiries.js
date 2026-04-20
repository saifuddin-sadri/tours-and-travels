const express = require('express');
const router = express.Router();
const { submitInquiry, getWhatsAppUrl } = require('../controllers/inquiryController');

// POST /api/inquiries
router.post('/', submitInquiry);

// POST /api/inquiries/whatsapp
router.post('/whatsapp', getWhatsAppUrl);

module.exports = router;
