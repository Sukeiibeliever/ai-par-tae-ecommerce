// backend/routes/bargainRoutes.js
const express = require('express');
const router = express.Router();
const bargainController = require('../controllers/bargainController');

// '/bargain' အစား '/' သို့ ပြောင်းရန်
router.post('/', bargainController.handleBargain);

module.exports = router;