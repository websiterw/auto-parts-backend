const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return res.status(403).json({ msg: 'Admin access required' });
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};