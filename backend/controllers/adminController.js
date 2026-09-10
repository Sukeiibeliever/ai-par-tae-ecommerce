const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactMessage = require('../models/ContactMessage');
const { signToken } = require('../utils/token');

const DEFAULT_ARRIVAL_HOURS = Math.max(1, Number(process.env.ORDER_ARRIVAL_HOURS) || 72);
const CANCELLATION_MESSAGE = 'Your order is cancelled. Please check your payment method and payment status. If you already paid, contact NaNb support.';

function buildEstimatedArrival(fromDate) {
    const base = fromDate instanceof Date ? fromDate : new Date(fromDate || Date.now());
    return new Date(base.getTime() + DEFAULT_ARRIVAL_HOURS * 60 * 60 * 1000);
}

async function restoreOrderStock(order) {
    if (!order || order.stockRestored || !Array.isArray(order.items) || !order.items.length) {
        return { restored: !!(order && order.stockRestored), warnings: [] };
    }

    const warnings = [];
    let restoredAny = false;

    for (const item of order.items) {
        const objectId = item.product || null;
        const numericId = Number(item.productId);
        const size = String(item.selectedSize || '').trim();
        const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
        if ((!objectId && !Number.isFinite(numericId)) || !size || !quantity) continue;

        try {
            let product = null;
            if (objectId) product = await Product.findById(objectId);
            if (!product && Number.isFinite(numericId)) product = await Product.findOne({ id: numericId });

            if (!product) {
                warnings.push(`Product ${Number.isFinite(numericId) ? '#' + numericId : ''} was not found while restoring stock.`);
                continue;
            }

            const inventory = Array.isArray(product.inventory) ? product.inventory : [];
            const slot = inventory.find((entry) => String(entry.size || '').trim() === size);
            if (!slot) {
                warnings.push(`${product.name || 'Product'} (${size}) has no matching inventory slot.`);
                continue;
            }

            slot.quantity = Math.max(0, Number(slot.quantity) || 0) + quantity;
            product.stock = inventory.reduce((sum, entry) => sum + Math.max(0, Number(entry.quantity) || 0), 0);
            product.instock_size = inventory
                .filter((entry) => Math.max(0, Number(entry.quantity) || 0) > 0)
                .map((entry) => String(entry.size || '').trim())
                .filter(Boolean);
            await product.save();
            restoredAny = true;
        } catch (error) {
            console.error(`Stock restore failed for order ${order.orderId || ''}:`, error);
            warnings.push(`Could not restore one item (${size}).`);
        }
    }

    return { restored: restoredAny || warnings.length === 0, warnings };
}

function adminUserJSON(user) {
    return {
        id: String(user._id),
        name: user.name,
        username: user.username || '',
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}

exports.login = async (req, res) => {
    try {
        const identifier = String(req.body && (req.body.username || req.body.email) || '').toLowerCase().trim();
        const password = String(req.body && req.body.password || '');
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Admin username and password are required' });
        }

        const user = await User.findOne({
            role: 'admin',
            $or: [{ username: identifier }, { email: identifier }]
        }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        res.json({
            success: true,
            message: 'Admin login successful',
            token: signToken({ type: 'auth', userId: String(user._id), role: 'admin' }),
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Admin login failed' });
    }
};

exports.dashboard = async (req, res) => {
    try {
        const [products, users, orders, subscribers, contactCount] = await Promise.all([
            Product.find({}).sort({ id: 1 }).lean(),
            User.find({}).sort({ createdAt: -1 }).select('name username email role createdAt').lean(),
            Order.find({ adminHidden: { $ne: true } }).sort({ createdAt: -1 }).populate('user', 'email name').lean(),
            NewsletterSubscriber.find({}).sort({ createdAt: -1 }).lean(),
            ContactMessage.countDocuments({ status: 'New' })
        ]);

        res.json({
            success: true,
            stats: {
                products: products.length,
                users: users.length,
                orders: orders.length,
                newsletter: subscribers.length,
                newMessages: contactCount
            },
            products: products.map((product) => ({
                id: product.id,
                name: product.name,
                brand: product.brand,
                category: product.category,
                price: product.price,
                stock: product.stock
            })),
            users: users.map((user) => ({
                id: String(user._id),
                name: user.name,
                username: user.username || '',
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            })),
            orders: orders.map((order) => ({
                orderId: order.orderId,
                customerEmail: order.user && order.user.email ? order.user.email : '—',
                item: order.item,
                status: order.status,
                price: order.grandTotal || order.price || 0,
                acceptedAt: order.acceptedAt || null,
                estimatedArrivalAt: order.estimatedArrivalAt || null,
                createdAt: order.createdAt
            })),
            subscribers: subscribers.map((entry) => ({
                id: String(entry._id),
                email: entry.email,
                createdAt: entry.createdAt
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const allowed = ['Pending', 'Accepted', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        const status = String(req.body && req.body.status || '').trim();
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }

        const order = await Order.findOne({ orderId: String(req.params.orderId || '').toUpperCase().trim() });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.status === 'Cancelled' && status !== 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Cancelled orders cannot be reopened' });
        }

        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            if (order.status === 'Delivered') {
                return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled' });
            }
            await restoreOrderStock(order);
            order.cancelledAt = new Date();
            order.cancellationMessage = CANCELLATION_MESSAGE;
        }

        if (['Accepted', 'Confirmed', 'Processing'].includes(status) && !order.acceptedAt) {
            order.acceptedAt = new Date();
            order.estimatedArrivalAt = buildEstimatedArrival(order.acceptedAt);
        }

        order.status = status;
        await order.save();
        res.json({
            success: true,
            message: 'Order status updated',
            orderId: order.orderId,
            status: order.status,
            acceptedAt: order.acceptedAt,
            estimatedArrivalAt: order.estimatedArrivalAt,
            cancelledAt: order.cancelledAt,
            cancellationMessage: order.cancellationMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

exports.acceptOrder = async (req, res) => {
    try {
        const orderId = String(req.params.orderId || '').toUpperCase().trim();
        const order = await Order.findOne({ orderId, adminHidden: { $ne: true } });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Cancelled orders cannot be accepted' });
        }
        if (order.status === 'Delivered') {
            return res.status(400).json({ success: false, message: 'This order is already delivered' });
        }

        const acceptedAt = order.acceptedAt || new Date();
        order.status = 'Accepted';
        order.acceptedAt = acceptedAt;
        order.estimatedArrivalAt = order.estimatedArrivalAt || buildEstimatedArrival(acceptedAt);
        await order.save();

        res.json({
            success: true,
            message: 'Order accepted successfully',
            orderId: order.orderId,
            status: order.status,
            acceptedAt: order.acceptedAt,
            estimatedArrivalAt: order.estimatedArrivalAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to accept order' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = String(req.params.orderId || '').toUpperCase().trim();
        const order = await Order.findOne({ orderId, adminHidden: { $ne: true } });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found or already removed from the admin list' });
        if (order.status === 'Delivered') {
            return res.status(400).json({ success: false, message: 'Delivered orders cannot be deleted/cancelled' });
        }

        const alreadyCancelled = order.status === 'Cancelled';
        const cancelledAt = order.cancelledAt || new Date();

        // Mark the order cancelled/hidden first with an atomic update. This avoids
        // full-document validation failures on older orders while preserving the
        // customer-visible cancellation record.
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, adminHidden: { $ne: true } },
            {
                $set: {
                    status: 'Cancelled',
                    cancelledAt,
                    cancellationMessage: CANCELLATION_MESSAGE,
                    adminHidden: true
                }
            },
            { new: true, runValidators: false }
        );

        if (!updatedOrder) {
            return res.status(409).json({ success: false, message: 'Order was already changed. Refresh the admin page and try again.' });
        }

        let stockWarning = '';
        if (!alreadyCancelled && !order.stockRestored) {
            const stockResult = await restoreOrderStock(order);
            if (stockResult.restored) {
                await Order.updateOne({ _id: order._id }, { $set: { stockRestored: true } });
            }
            if (stockResult.warnings.length) {
                stockWarning = ' Order was cancelled, but one or more stock entries could not be restored automatically.';
            }
        }

        res.json({
            success: true,
            message: 'Order cancelled and removed from the admin list. The customer can still see the cancellation notice.' + stockWarning,
            orderId: updatedOrder.orderId,
            status: 'Cancelled',
            cancelledAt: updatedOrder.cancelledAt,
            cancellationMessage: updatedOrder.cancellationMessage,
            stockRestored: !!(updatedOrder.stockRestored || (!alreadyCancelled && !stockWarning)),
            stockWarning: stockWarning.trim()
        });
    } catch (error) {
        console.error('Delete/cancel order failed:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete/cancel order' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const product = await Product.findOne({ id: productId });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        ['name', 'description', 'color'].forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) product[key] = String(req.body[key] || '').trim();
        });
        if (Object.prototype.hasOwnProperty.call(req.body || {}, 'price')) product.price = Number(req.body.price);
        if (Object.prototype.hasOwnProperty.call(req.body || {}, 'rating')) product.rating = Number(req.body.rating);

        if (Array.isArray(req.body && req.body.inventory)) {
            const inventory = req.body.inventory
                .map((slot) => ({ size: String(slot.size || '').trim(), quantity: Math.max(0, Math.floor(Number(slot.quantity) || 0)) }))
                .filter((slot) => slot.size);
            product.inventory = inventory;
            product.instock_size = inventory.filter((slot) => slot.quantity > 0).map((slot) => slot.size);
            product.stock = inventory.reduce((sum, slot) => sum + slot.quantity, 0);
        } else if (Array.isArray(req.body && req.body.instock_size)) {
            const sizes = [...new Set(req.body.instock_size.map((size) => String(size || '').trim()).filter(Boolean))];
            const current = new Map((product.inventory || []).map((slot) => [slot.size, Number(slot.quantity) || 0]));
            product.inventory = sizes.map((size) => ({ size, quantity: current.has(size) ? current.get(size) : 5 }));
            product.instock_size = sizes;
            product.stock = product.inventory.reduce((sum, slot) => sum + slot.quantity, 0);
        }

        await product.save();
        const result = product.toObject();
        delete result.inventory;
        res.json({ success: true, message: 'Product updated', product: result });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update product' });
    }
};

exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) return res.status(404).json({ success: false, message: 'Subscriber not found' });
        res.json({ success: true, message: 'Subscriber removed' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid subscriber ID' });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
        res.json({ success: true, count: messages.length, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load contact messages' });
    }
};
