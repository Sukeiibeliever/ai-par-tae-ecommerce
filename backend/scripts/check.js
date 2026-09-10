const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.join(__dirname, '../..');
const backendRoot = path.join(projectRoot, 'backend');
const frontendRoot = path.join(projectRoot, 'frontend');
let failed = false;

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else files.push(full);
    }
    return files;
}

for (const file of walk(backendRoot).concat(walk(path.join(frontendRoot, 'assets/js')))) {
    if (!file.endsWith('.js')) continue;
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
        failed = true;
        console.error(`Syntax error: ${path.relative(projectRoot, file)}`);
        console.error(result.stderr);
    }
}

const rawProducts = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'assets/js/Products.json'), 'utf8'));
const ids = new Set();
for (const product of rawProducts) {
    if (ids.has(product.id)) {
        failed = true;
        console.error(`Duplicate product ID: ${product.id}`);
    }
    ids.add(product.id);
    const image = String(product.image || '');
    const relative = image.includes('/') ? image : `assets/images/${image}`;
    if (!fs.existsSync(path.join(frontendRoot, relative))) {
        failed = true;
        console.error(`Missing image for product ${product.id}: ${relative}`);
    }
}

if (failed) process.exit(1);
console.log(`Checks passed: JavaScript syntax OK, ${rawProducts.length} unique products, all product images found.`);
