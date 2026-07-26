const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', auth, productController.getProducts);
// Admin routes later

module.exports = router;