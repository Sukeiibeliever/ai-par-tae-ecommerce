const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../utils/token');

const APPRAISAL_FEE = 15000;
const PROMO_CODES = {
    NA_BRAIN_2026: { type: 'percent', value: 10 },
    HYPE2026: { type: 'fixed', value: 50000 }
};

function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function formatOrder(order) {
    const doc = order && typeof order.toObject === 'function' ? order.toObject() : order;
    const items = Array.isArray(doc.items) ? doc.items : [];
    return {
        orderId: doc.orderId,
        status: doc.status,
        item: doc.item,
        brand: doc.brand || (items[0] ? items[0].brand : ''),
        category: doc.category || (items[0] ? items[0].category : 'sneakers'),
        price: Number(doc.grandTotal || doc.price || 0),
        grade: doc.grade || '',
        detail: doc.detail || '',
        items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            brand: item.brand,
            category: item.category,
            image: item.image,
            selectedSize: item.selectedSize,
            qty: item.quantity,
            price: item.unitPrice,
            originalPrice: item.originalPrice,
            isNegotiatedDeal: !!item.negotiated
        })),
        customer: doc.customer || null,
        payment: doc.payment ? {
            method: doc.payment.method,
            status: doc.payment.status
        } : null,
        promoCode: doc.promoCode || '',
        subtotal: Number(doc.subtotal || 0),
        discount: Number(doc.discount || 0),
        appraisalFee: Number(doc.appraisalFee || 0),
        grandTotal: Number(doc.grandTotal || doc.price || 0),
        acceptedAt: doc.acceptedAt || null,
        estimatedArrivalAt: doc.estimatedArrivalAt || null,
        cancelledAt: doc.cancelledAt || null,
        cancellationMessage: doc.cancellationMessage || '',
        createdAt: doc.createdAt || doc.updatedAt,
        updatedAt: formatDate(doc.updatedAt || doc.createdAt)
    };
}

function buildOrderId() {
    return `NANB-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function summarizeItems(items) {
    if (!items.length) return 'NaNb acquisition';
    if (items.length === 1) return items[0].name;
    return `${items.length} items (${items[0].name})`;
}

function calculateDiscount(subtotal, promoCode) {
    const normalized = String(promoCode || '').trim().toUpperCase();
    const promo = PROMO_CODES[normalized];
    if (!promo) return { promoCode: '', discount: 0 };
    const discount = promo.type === 'percent'
        ? Math.round(subtotal * promo.value / 100)
        : Math.min(subtotal, promo.value);
    return { promoCode: normalized, discount };
}

function sanitizeCheckoutInput(body) {
    const customer = body && body.customer || {};
    const payment = body && body.payment || {};
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    const address = String(customer.address || '').trim();
    const method = String(payment.method || '').trim();
    const note = String(payment.note || '').trim();

    if (name.length < 2 || name.length > 80) throw new Error('Enter a valid customer name');
    if (phone.length < 6 || phone.length > 30) throw new Error('Enter a valid phone number');
    if (address.length < 5 || address.length > 300) throw new Error('Enter a valid delivery address');
    if (!['KPay', 'Wave Money', 'COD', 'Bank Transfer'].includes(method)) throw new Error('Select a valid payment method');
    if (note.length > 200) throw new Error('Payment note is too long');

    return { customer: { name, phone, address }, payment: { method, note } };
}

async function resolveCheckoutItems(rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw new Error('Cart is empty');
    if (rawItems.length > 30) throw new Error('Too many cart items');

    const normalized = rawItems.map((item) => {
        const productId = Number(item.id || item.productId);
        const quantity = Math.max(1, Math.min(10, Math.floor(Number(item.qty || item.quantity) || 1)));
        const selectedSize = String(item.selectedSize || '').trim();
        return {
            productId,
            quantity,
            selectedSize,
            negotiated: !!item.negotiated,
            dealToken: String(item.dealToken || '')
        };
    });

    if (normalized.some((item) => !Number.isFinite(item.productId) || item.productId <= 0)) {
        throw new Error('Cart contains an invalid product');
    }

    const ids = [...new Set(normalized.map((item) => item.productId))];
    const products = await Product.find({ id: { $in: ids } });
    const byId = new Map(products.map((product) => [product.id, product]));

    return normalized.map((input) => {
        const product = byId.get(input.productId);
        if (!product) throw new Error(`Product #${input.productId} is unavailable`);

        const availableSizes = Array.isArray(product.instock_size) ? product.instock_size : [];
        const selectedSize = input.selectedSize || availableSizes[0] || 'Free Size';
        if (availableSizes.length && !availableSizes.includes(selectedSize)) {
            throw new Error(`${product.name}: selected size is unavailable`);
        }

        const stockSlot = (product.inventory || []).find((slot) => slot.size === selectedSize);
        const availableQty = stockSlot ? Number(stockSlot.quantity) : Number(product.stock || 0);
        if (availableQty < input.quantity) {
            throw new Error(`${product.name} (${selectedSize}) has only ${Math.max(0, availableQty)} left`);
        }

        let unitPrice = Number(product.price);
        let negotiated = false;
        if (input.negotiated || input.dealToken) {
            if (!input.dealToken) throw new Error(`${product.name}: bargain deal expired. Please negotiate again.`);
            let deal;
            try {
                deal = verifyToken(input.dealToken, 'bargain');
            } catch (error) {
                throw new Error(`${product.name}: bargain deal expired or is invalid. Please negotiate again.`);
            }
            if (Number(deal.productId) !== product.id || Number(deal.originalPrice) !== Number(product.price)) {
                throw new Error(`${product.name}: bargain deal does not match this product`);
            }
            unitPrice = Math.round(Number(deal.finalPrice));
            if (!Number.isFinite(unitPrice) || unitPrice < Math.round(product.price * 0.90) || unitPrice > product.price) {
                throw new Error(`${product.name}: bargain price is invalid`);
            }
            negotiated = true;
        }

        return {
            product,
            productId: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            image: product.image,
            selectedSize,
            quantity: input.quantity,
            unitPrice,
            originalPrice: Number(product.price),
            negotiated
        };
    });
}

async function decrementStock(items) {
    const completed = [];
    try {
        for (const item of items) {
            const result = await Product.updateOne(
                {
                    _id: item.product._id,
                    inventory: { $elemMatch: { size: item.selectedSize, quantity: { $gte: item.quantity } } }
                },
                {
                    $inc: {
                        'inventory.$.quantity': -item.quantity,
                        stock: -item.quantity
                    }
                }
            );
            if (result.modifiedCount !== 1) {
                throw new Error(`${item.name} (${item.selectedSize}) just went out of stock`);
            }
            completed.push(item);
        }
    } catch (error) {
        for (const item of completed) {
            await Product.updateOne(
                { _id: item.product._id, 'inventory.size': item.selectedSize },
                { $inc: { 'inventory.$.quantity': item.quantity, stock: item.quantity } }
            ).catch(() => {});
        }
        throw error;
    }
}

async function restoreStock(items) {
    for (const item of items) {
        await Product.updateOne(
            { _id: item.product._id, 'inventory.size': item.selectedSize },
            { $inc: { 'inventory.$.quantity': item.quantity, stock: item.quantity } }
        ).catch(() => {});
    }
}

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, count: orders.length, orders: orders.map(formatOrder) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load orders' });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const orderId = String(req.params.orderId || '').toUpperCase().trim();
        const order = await Order.findOne({ orderId, user: req.user._id }).lean();
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order: formatOrder(order) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to track order' });
    }
};

exports.checkout = async (req, res) => {
    let resolvedItems = [];
    let stockReserved = false;
    try {
        const safe = sanitizeCheckoutInput(req.body || {});
        resolvedItems = await resolveCheckoutItems(req.body && req.body.items);
        const subtotal = resolvedItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
        const promo = calculateDiscount(subtotal, req.body && req.body.promoCode);
        const grandTotal = Math.max(0, subtotal - promo.discount + APPRAISAL_FEE);
        const detail = resolvedItems
            .map((item) => `${item.name}${item.selectedSize ? ` / ${item.selectedSize}` : ''} x${item.quantity}`)
            .join(' | ');

        await decrementStock(resolvedItems);
        stockReserved = true;

        const order = await Order.create({
            orderId: buildOrderId(),
            user: req.user._id,
            status: 'Pending',
            items: resolvedItems.map((item) => ({
                product: item.product._id,
                productId: item.productId,
                name: item.name,
                brand: item.brand,
                category: item.category,
                image: item.image,
                selectedSize: item.selectedSize,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                originalPrice: item.originalPrice,
                negotiated: item.negotiated
            })),
            customer: safe.customer,
            payment: {
                ...safe.payment,
                status: safe.payment.method === 'COD' ? 'Pending' : 'Submitted'
            },
            promoCode: promo.promoCode,
            subtotal,
            discount: promo.discount,
            appraisalFee: APPRAISAL_FEE,
            grandTotal,
            item: summarizeItems(resolvedItems),
            brand: resolvedItems[0].brand,
            category: resolvedItems[0].category,
            price: grandTotal,
            detail
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: formatOrder(order)
        });
    } catch (error) {
        if (stockReserved && resolvedItems.length) await restoreStock(resolvedItems);
        console.error(error);
        const clientErrors = [
            'Cart is empty', 'Too many cart items', 'invalid product', 'unavailable', 'out of stock', 'only',
            'bargain', 'customer name', 'phone number', 'delivery address', 'payment method', 'Payment note'
        ];
        const status = clientErrors.some((text) => String(error.message).toLowerCase().includes(text.toLowerCase())) ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? error.message : 'Checkout failed' });
    }
};

module.exports.formatOrder = formatOrder;
