function createRateLimiter(options = {}) {
    const windowMs = Math.max(1000, Number(options.windowMs) || 15 * 60 * 1000);
    const max = Math.max(1, Number(options.max) || 100);
    const message = options.message || 'Too many requests. Please try again later.';
    const buckets = new Map();

    return function rateLimiter(req, res, next) {
        const now = Date.now();
        const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.baseUrl}${req.path}`;
        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

        if (bucket.count > max) {
            res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
            return res.status(429).json({ success: false, message });
        }

        if (buckets.size > 5000) {
            for (const [bucketKey, value] of buckets) {
                if (value.resetAt <= now) buckets.delete(bucketKey);
            }
        }
        next();
    };
}

module.exports = createRateLimiter;
