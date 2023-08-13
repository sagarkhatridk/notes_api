const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");
//create a use using: POST "/api/auth/" doesn't require auth

const JWT_SECRET = "inotebook";
router.post(
  "/createuser",
  [
    body("name", "param not matched with requirements").isLength({ min: 3 }),
    body("email", "param not matched with requirements").isEmail(),
    body("password", "param not matched with requirements").isLength({
      min: 6,
    }),
  ],

  async (req, res) => {
    let success = false
    // if there are errors
    const Errors = validationResult(req);
    if (!Errors.isEmpty()) {
      return res.status(400).json({success,
        errors: Errors.array(),
      });
    }

    let user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      return res.status(400).json({success, Error: "user already exists" });
    }
    const salt = await bcrypt.genSalt(10);

    const seqPassword = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: seqPassword,
    });

    const data = {
      user: {
        id: user.id,
      },
    };
    success = true
    const authToekn = jwt.sign(data, JWT_SECRET);
    res.status(201).json({success, authToekn });
  }
);

//authenticate a user: POST '/api/auth/login'

router.post(
  "/login",
  [
    body("email", "param not matched with requirements").isEmail(),
    body("password", "password can not be blank ").exists(),
  ],

  async (req, res) => {
    let success = false
    const Errors = validationResult(req);
    if (!Errors.isEmpty()) {
      return res.status(400).json({
        errors: Errors.array(),
      });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please login via correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({success, error: "Please login via correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToekn = jwt.sign(data, JWT_SECRET);
      success = true;
      res.send({ success, authToekn });
    } catch (error) {
      res.status(500).send({ error: "Something wend wrong!" });
    }
  }
);

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: "Something wend wrong!" });
  }
});

module.exports = router;
