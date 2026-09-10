const crypto = require('crypto');
const config = require('../config');

function encode(value) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signEncoded(encoded) {
    return crypto.createHmac('sha256', config.authSecret).update(encoded).digest('base64url');
}

function signToken(payload, ttlSeconds) {
    const now = Math.floor(Date.now() / 1000);
    const body = {
        ...payload,
        iat: now,
        exp: now + Math.max(60, Number(ttlSeconds) || config.authTokenHours * 3600)
    };
    const encoded = encode(body);
    return `${encoded}.${signEncoded(encoded)}`;
}

function verifyToken(token, expectedType) {
    if (!token || typeof token !== 'string' || token.indexOf('.') === -1) {
        throw new Error('Invalid token');
    }

    const [encoded, signature] = token.split('.');
    const expected = signEncoded(encoded);
    const actualBuffer = Buffer.from(signature || '');
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
        throw new Error('Invalid token');
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    } catch (error) {
        throw new Error('Invalid token');
    }

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) throw new Error('Token expired');
    if (expectedType && payload.type !== expectedType) throw new Error('Invalid token type');
    return payload;
}

module.exports = { signToken, verifyToken };
