module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'API Key required' });
    }

    const admin = global.db.admins.find(a => a.apiKey === apiKey);
    if (!admin) {
        return res.status(403).json({ error: 'Invalid API Key' });
    }

    req.admin = admin; // Pass admin info
    next();
};
