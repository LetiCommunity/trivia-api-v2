/**
 * Module for handling JWT authentication
 * @module authJwt
 */

/**
 * Module for handling user sign-up verification
 * @module verifySignUp
 */

const authJwt = require("./authjwt"); // Importing the authJwt module
const verifySignUp = require("./verifySignUp"); // Importing the verifySignUp module

module.exports = {
  authJwt, // Exporting the authJwt module
  verifySignUp, // Exporting the verifySignUp module
};