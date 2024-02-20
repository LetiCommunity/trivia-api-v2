const express = require("express");
const bcrypt = require("bcryptjs");

const Employee = require("../models/employee.model.js");
const User = require("../models/user.model.js");
const Role = require("../models/role.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");
const verifySignUp = require("../middleware/verifySignUp");

const router = express.Router();

/* Employee routes */

// Getting all employees
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const employee = await Employee.find()
        .populate("user")
        .populate("permissions")
        .exec();
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
      const employee = await Employee.findById(id).populate("user").exec();
      if (!employee) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Creating a employee
router.post(
  routes.create,
  [
    verifySignUp.checkDuplicateUsername,
    authjwt.verifyToken,
    authjwt.isSuperAdmin,
  ],
  async (req, res) => {
    const {
      name,
      surname,
      phoneNumber,
      email,
      username,
      password,
      local,
      permissions,
    } = req.body;

    if (
      !name ||
      !surname ||
      !phoneNumber ||
      !email ||
      !username ||
      !password ||
      !local ||
      !permissions
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const lowerUsername = username.toLowerCase();
    const roleExisting = await Role.find({
      name: { $ne: "SUPER_ADMIN_ROLE" },
    });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: lowerUsername,
      password: hashedPassword,
      roles: roleExisting,
      state: true,
    });

    await User.create(newUser)
      .then((savedUser) => {
        const newEmployee = new Employee({
          user: savedUser,
          local: local,
          permissions: [permissions],
        });
        Employee.create(newEmployee);
        res.json({ message: "The employee has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

// Updating a employee
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { name, surname, phoneNumber, email, local, permissions } = req.body;

    if (!name || !surname || !phoneNumber || !email || !local || !permissions) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const updatedUser = {
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
    };

    await User.findByIdAndUpdate(id, updatedUser)
      .then((updatedUser) => {
        const updatedEmployee = new Employee({
          user: updatedUser,
          local: local,
          permissions: [permissions],
        });
        Employee.create(updatedEmployee);
        res.json({ message: "The employee has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

// Deleting a employee
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    Employee.deleteOne(employee._id)
      .then(() => {
        res.json({ message: "The employee has been deleted correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The employee could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
