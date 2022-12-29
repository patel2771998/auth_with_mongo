const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];


  if (!token) {
    return res.status(403).send({
      message: "No Token Provided!"
    });
  }

  jwt.verify(token, 'tixzar_app', (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};


const authJwt = {
  verifyToken: verifyToken,
};
module.exports = authJwt;
