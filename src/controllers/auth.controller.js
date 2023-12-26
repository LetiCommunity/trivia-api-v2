const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Role = require("../models/role.model");
const verifySignUp = require("../middleware/verifySignUp");
const { routes } = require("../config/routes");
const { JWT_SECRET, TOKEN_EXPIRATION } = require("../config/environment");

const router = express.Router();

/* Login route */

// Logup
router.post(
  routes.signup,
  [verifySignUp.checkDuplicateUsername],
  async (req, res) => {
    try {
      const { name, surname, phoneNumber, email, username, password } =
        req.body;

      if (!name || !surname || !phoneNumber || !username || !password) {
        return res
          .status(400)
          .json({ message: "Complete the required fields" });
      }

      const lowerUsername = username.toLowerCase();
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const role = await Role.findOne({ name: "USER_ROLE" }, { _id: 1 });

      const newUser = new User({
        name: name,
        surname: surname,
        phoneNumber: phoneNumber,
        email: email,
        username: lowerUsername,
        password: hashedPassword,
        roles: [role],
        state: true,
      });

      await User.create(newUser)
        .then(() => {
          res.json({ message: "The user has been created correctly" });
        })
        .catch((error) => {
          res.status(500).json({
            message: "The user could not be performed: " + error.message,
          });
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// Login
router.post(routes.signin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the fields have content
    if (!username || !password) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    // Change the username to lowercase and is looking for it in the authentication database
    const lowerUsername = username.toLowerCase();
    const userExisting = await User.findOne({
      username: lowerUsername,
    })
      .populate("roles")
      .exec();

    // Check if the user is already
    if (!userExisting) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    if (!userExisting.state) {
      return res.status(400).json({ message: "This account has been deleted" });
    }

    // Check if the user password is correct
    if (!bcrypt.compareSync(password, userExisting.password)) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    // Create the token
    const token = jwt.sign(
      {
        id: userExisting._id,
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: TOKEN_EXPIRATION,
      }
    );

    let authorities = [];

    for (let i = 0; i < userExisting.roles.length; i++) {
      authorities.push(userExisting.roles[i].name);
    }

    res.cookie("token", token);

    return res.json({
      user: userExisting,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post(routes.signout, async (req, res) => {
  try {
    req.session = null;
    return res.json({ message: "You've been signed out!" });
  } catch (error) {
    this.next(error);
  }
});

module.exports = router;
