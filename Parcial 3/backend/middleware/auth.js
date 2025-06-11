const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  jwt.verify(token, 'secreto_super_seguro', (err, decoded) => {
    if (err) return res.sendStatus(403); // aquí está fallando
    req.userId = decoded.userId;
    next();
  });
}

module.exports = authenticateToken;
