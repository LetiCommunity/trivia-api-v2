const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const Role = require("../models/role.model.js");
const Permission = require("../models/permission.model.js");

const init = async () => {
  //Roles
  const userRole = new Role({
    name: "USER_ROLE",
  });

  const adminRole = new Role({
    name: "ADMIN_ROLE",
  });

  const superAdminRole = new Role({
    name: "SUPER_ADMIN_ROLE",
  });

  //Permissions
  const deliveryPermision = new Permission({
    name: "DELIVERY_PERMISSION",
  });

  const shippingPermision = new Permission({
    name: "SHIPPING_PERMISSION",
  });

  const receivingPermision = new Permission({
    name: "RECEIVING_PERMISSION",
  });

  const completePermision = new Permission({
    name: "COMPLETE_PERMISSION",
  });

  const newRoles = [superAdminRole, adminRole, userRole];
  const newPermissions = [
    deliveryPermision,
    shippingPermision,
    receivingPermision,
    completePermision,
  ];

  for (i = 0; i < newRoles.length; i++) {
    const roleExisting = await Role.findOne({ name: newRoles[i].name });
    if (!roleExisting) {
      await Role.create({
        name: newRoles[i].name,
      })
        .then(() => {
          console.log("Role created");
        })
        .catch((error) => {
          console.log("Error creating role: " + error.message);
        });
    }
  }

  for (i = 0; i < newPermissions.length; i++) {
    const permissionExisting = await Permission.findOne({
      name: newPermissions[i].name,
    });
    if (!permissionExisting) {
      await Permission.create({
        name: newPermissions[i].name,
      })
        .then(() => {
          console.log("Permission created");
        })
        .catch((error) => {
          console.log("Error creating permission: " + error.message);
        });
    }
  }

  const roles = await Role.find({}, { _id: 1 });
  const userExisting = await User.findOne({ username: "admin" });

  if (userExisting) {
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("admin", salt);

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

  await User.create(admin)
    .then(() => {
      console.log("User admin created");
    })
    .catch((error) => {
      console.log("Error creating user admin: " + error);
    });
};

module.exports = init;
