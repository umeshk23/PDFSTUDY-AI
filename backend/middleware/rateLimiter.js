const buckets = new Map();

const cleanupBuckets = (currentTime) => {
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetTime <= currentTime) {
            buckets.delete(key);
        }
    }
};

const rateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = {
        success: false,
        error: 'Too many requests, please try again later.',
        statusCode: 429,
    },
} = {}) => (req, res, next) => {
    const currentTime = Date.now();
    cleanupBuckets(currentTime);

    const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const bucketKey = `${identifier}:${req.baseUrl || req.path}`;
    const currentBucket = buckets.get(bucketKey);

    if (!currentBucket || currentBucket.resetTime <= currentTime) {
        buckets.set(bucketKey, {
            count: 1,
            resetTime: currentTime + windowMs,
        });
        return next();
    }

    if (currentBucket.count >= max) {
        res.setHeader('Retry-After', Math.ceil((currentBucket.resetTime - currentTime) / 1000));
        return res.status(429).json(message);
    }

    currentBucket.count += 1;
    buckets.set(bucketKey, currentBucket);
    return next();
};

export default rateLimiter;
