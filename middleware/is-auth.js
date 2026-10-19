const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const [scheme, token] = String(req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'social-feed-api',
      audience: 'social-feed-client'
    });
    req.userId = decoded.userId;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};
