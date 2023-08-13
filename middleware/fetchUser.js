const JWT_SECRET = "inotebook";
const jwt = require("jsonwebtoken");

const fetchuser = (req, res, next) => {
  // get the user from the jwt token and add ID to req object

  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "login failed" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "login failed" });
  }
};

module.exports = fetchuser;
