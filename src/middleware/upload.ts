// import multer = require('multer');
// import path = require('path');

// // Configure disk storage parameters
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     // Files will be dropped directly into your root server/uploads folder
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: (_req, file, cb) => {
//     // Generate an airtight unique timestamp prefix for every file
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // Initialize multer middleware instance
// const upload = multer({ 
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // Strict 10MB limit per file
// });

// // 🚀 FIXED: Clear CommonJS export assignment to eliminate the runtime 'upload.array is not a function' error
// export = upload;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'uploads/');
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Export it as an object property
module.exports = { upload };