const fs = require('fs');
const path = require('path');
const { transformProducts } = require('../utils/productTransform');

const productsPath = path.join(__dirname, '../../frontend/assets/js/Products.json');
const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

module.exports = transformProducts(rawProducts);
