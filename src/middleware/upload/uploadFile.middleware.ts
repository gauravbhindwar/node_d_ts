import multer from 'multer';
import { pdfOnlyFilter } from './fileFilter';
import { contractStorage } from './storageConfig';

const upload = multer({
  storage: contractStorage,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadSignedContract = upload.single('file');
