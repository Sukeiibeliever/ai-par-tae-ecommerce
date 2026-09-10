require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/database');
const Product = require('../models/Product');
const products = require('../data/products');
const bootstrapAdmin = require('../utils/bootstrapAdmin');

async function seed() {
    await connectDB();

    await Product.deleteMany({});
    await Product.insertMany(
        products.map((product) => ({
            ...product,
            createdAt: new Date(product.createdAt)
        }))
    );

    await bootstrapAdmin();
    console.log(`Seeded ${products.length} products. Existing users and orders were preserved.`);
    process.exit(0);
}

seed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
});
