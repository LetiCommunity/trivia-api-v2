const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const Role = require("../models/role.model.js");

const init = async () => {
  const userRole = new Role({
    name: "USER_ROLE",
  });

  const adminRole = new Role({
    name: "ADMIN_ROLE",
  });

  const superAdminRole = new Role({
    name: "SUPER_ADMIN_ROLE",
  });

  const newRoles = [superAdminRole, adminRole, userRole];

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

  const roles = await Role.find({}, {"_id": 1});
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
