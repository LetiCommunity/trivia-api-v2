// Multer configuration
// Description: This module configures the multer library for handling file uploads.

const multer = require("multer"); // Import the multer library

// Configure storage settings for multer
const storage = multer.diskStorage({
  // Set the destination directory for uploaded files
  destination: (req, file, callback) => {
    // Parameters:
    // - req: The request object
    // - file: The file being uploaded
    // - callback: The callback function to be called when the destination is set
    callback(null, "public/images"); // Specify the destination directory
  },
  // Set the filename for the uploaded file
  filename: (req, file, callback) => {
    // Parameters:
    // - req: The request object
    // - file: The file being uploaded
    // - callback: The callback function to be called when the filename is set
    callback(null, `${Date.now()}_${file.originalname}`); // Use underscore instead of dot in the filename
  },
});
