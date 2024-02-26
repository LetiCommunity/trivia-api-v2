// Importing required modules
const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const Role = require("../models/role.model.js");
const Permission = require("../models/permission.model.js");

/**
 * Initializes roles, permissions, and a default admin user
 * @returns {Promise<void>}
 */
const init = async () => {
  // Creating role instances
  const rolesData = [
    { name: "USER_ROLE" },
    { name: "ADMIN_ROLE" },
    { name: "SUPER_ADMIN_ROLE" },
  ];

  // Creating permission instances
  const permissionsData = [
    { name: "DELIVERY_PERMISSION" },
    { name: "SHIPPING_PERMISSION" },
    { name: "RECEIVING_PERMISSION" },
    { name: "COMPLETE_PERMISSION" },
  ];

  // Creating new roles and permissions if they don't exist
  const createIfNotExists = async (Model, data) => {
    for (const item of data) {
      const existing = await Model.findOne({ name: item.name });
      if (!existing) {
        try {
          await Model.create({ name: item.name });
          console.log(`${Model.modelName} created`);
        } catch (error) {
          console.log(`Error creating ${Model.modelName}: ${error.message}`);
        }
      }
    }
  };

  await createIfNotExists(Role, rolesData);
  await createIfNotExists(Permission, permissionsData);

  // Finding all roles
  const roles = await Role.find({}, { _id: 1 });

  // Checking if the default admin user already exists
  const userExisting = await User.findOne({ username: "admin" });

  // If the default admin user exists, return from the function
  if (userExisting) {
    return;
  }

  // Generating a salt and hashing the default admin user's password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("admin", salt);

  // Creating a new admin user instance
  const admin = new User({
    name: "Crescencio Esono",
    surname: "NVE ANDEME",
    phoneNumber: "+240222589295",
    email: "nveandemecrescencioesono@gmail.com",
    image: "",
    username: "admin",
    password: hashedPassword,
    roles: roles,
    state: true,
  });

  // Creating the default admin user
  try {
    await User.create(admin);
    console.log("User admin created");
  } catch (error) {
    console.log("Error creating user admin: " + error);
  }
};

// Exporting the init function
module.exports = init;
