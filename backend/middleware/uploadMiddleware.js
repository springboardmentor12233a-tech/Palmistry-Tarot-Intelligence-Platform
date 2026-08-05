const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the directory exists
const uploadDir = path.join(__dirname, "../uploads/palms");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp + random suffix + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `palm-${uniqueSuffix}${ext}`);
  },
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const allowedMimetypes = /image\/jpeg|image\/jpg|image\/png/;

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Only JPG, JPEG, and PNG images are allowed!"), false);
  }
};

// Size limit configuration (5 MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB in bytes
  fileFilter: fileFilter,
});

module.exports = upload;
