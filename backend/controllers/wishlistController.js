const User = require('../models/User');
const Product = require('../models/Product');

async function readWishlist(userId) {
    const user = await User.findById(userId).select('wishlist').lean();
    return user && Array.isArray(user.wishlist) ? user.wishlist : [];
}

exports.getWishlist = async (req, res) => {
    try {
        res.json({ success: true, wishlist: await readWishlist(req.user._id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load wishlist' });
    }
};

exports.addWishlist = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const alertEnabled = req.body && req.body.alertEnabled !== false;
        if (!Number.isFinite(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
        const exists = await Product.exists({ id: productId });
        if (!exists) return res.status(404).json({ success: false, message: 'Product not found' });

        const updatedExisting = await User.updateOne(
            { _id: req.user._id, 'wishlist.productId': productId },
            { $set: { 'wishlist.$.alertEnabled': alertEnabled } }
        );
        if (!updatedExisting.matchedCount) {
            await User.updateOne(
                { _id: req.user._id },
                { $push: { wishlist: { productId, alertEnabled } } }
            );
        }

        res.json({ success: true, wishlist: await readWishlist(req.user._id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
};

exports.removeWishlist = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: { productId } } });
        res.json({ success: true, wishlist: await readWishlist(req.user._id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
};

exports.updateAlert = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const result = await User.updateOne(
            { _id: req.user._id, 'wishlist.productId': productId },
            { $set: { 'wishlist.$.alertEnabled': !!(req.body && req.body.alertEnabled) } }
        );
        if (!result.matchedCount) return res.status(404).json({ success: false, message: 'Wishlist item not found' });
        res.json({ success: true, wishlist: await readWishlist(req.user._id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update wishlist alert' });
    }
};
