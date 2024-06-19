const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  let authHeader = req.header("Authorization");
  let token;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7, authHeader.length).trim();
    // Now use this token for your validation logic
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1); // Remove the quotes from both ends of the string
    }
  } else {
    res.status(401).send({ message: "No token provided." });
  }
  if (!token) {
    return res.status(403).json({
      errors: [
        {
          message: "Unauthorized",
        },
      ],
    });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser._id.toString();
    next();
  } catch (error) {
    return res.status(403).json({
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
};
