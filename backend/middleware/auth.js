const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Missing or malformed authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Access denied. Invalid token payload.' });
    }
    req.user = { id: decoded.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
