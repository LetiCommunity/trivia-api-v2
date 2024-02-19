const express = require("express");
const bcrypt = require("bcryptjs");

const Employee = require("../models/employee.model.js");
const User = require("../models/user.model.js");
const Role = require("../models/role.model.js");
const Local = require("../models/local.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* Employee routes */

// Getting all employees
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const employee = await Employee.find();
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting a employee by id
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Creating a user
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { name, surname, phoneNumber, email, username, password } = req.body;

    if (!name || !surname || !phoneNumber || !email || !username || !password) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const lowerUsername = username.toLowerCase();
    const userExisting = await Employee.findOne({ username: lowerUsername });

    if (userExisting) {
      return res.status(409).json({ message: "This username already exists" });
    }

    const roleExisting = await Role.findOne({ name: "ADMIN_ROLE" }, { _id: 1 });
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new Employee({
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: username,
      username: lowerUsername,
      password: hashedPassword,
      roles: [roleExisting],
      state: true,
    });

    await Employee.create(newUser)
      .then(() => {
        res.json({ message: "The user has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

// Updating a user
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { name, surname, phoneNumber, email, username } = req.body;

    if (!name || !surname || !phoneNumber || !username) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const lowerUsername = username.toLowerCase();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const userUpdated = {
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: lowerUsername,
    };

    await Employee.findByIdAndUpdate(id, userUpdated)
      .then(() => {
        res.json({ message: "The user has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

// Deleting a user
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const user = await Employee.findById(id);

    Employee.deleteOne(user._id)
      .then(() => {
        res.json({ message: "The user has been deleted correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
