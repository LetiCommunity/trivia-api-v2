// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/images");
  },
  filename: (req, file, callback) => {
    //const ext = file.originalname.split(".").pop();
    callback(null, `${Date.now()}.${file.originalname}`);
  },
});