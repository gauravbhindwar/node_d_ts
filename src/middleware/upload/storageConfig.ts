import multer from 'multer';
import path from 'path';

export const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/contracts/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `contract-${req.params.id}-${timestamp}${ext}`);
  },
});
