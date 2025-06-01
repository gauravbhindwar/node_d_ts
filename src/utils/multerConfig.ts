import { cleanObj } from '@/helpers/common.helper';
import { errorFilterValidator } from '@/middleware/middleware';
import { Request } from 'express';
import _ from 'lodash';
import multer, { diskStorage, FileFilterCallback } from 'multer';
import path, { extname } from 'path';
import { folderExistCheck } from './common.util';

const publicFolder = ['logo', 'clientImage', 'profilePicture', 'profile'];
const storage = (foldername: string) =>
	diskStorage({
		destination: (_req, _file, cb) => {
			// if (_req.params.folderName) foldername = _req.params.folderName;
			if (publicFolder.includes(foldername)) {
				folderExistCheck(`./public/` + foldername + `/`);
				cb(null, './public/' + foldername + '/');
			} else {
				const publicFolders = path.join(__dirname, '../../secure-file/');
				folderExistCheck(publicFolders);
				const pdfPath = path.join(publicFolders, `${foldername}/`);
				cb(null, pdfPath);
			}
		},
		filename: (_req: Request, file, cb) => {
			return cb(null, file.originalname + '_' + Date.now() + extname(file.originalname));
		},
	});

const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback, fileType: string[]) => {
	//Put image file type validation here
	if (fileType.length > 0) {
		if (fileType.includes(file.mimetype)) {
			cb(null, true);
		} else {
			return cb(
				new Error('Only' + fileType.map((type) => ' ' + type.replace('image/', '.')) + ' file format allowed!'),
			);
		}
	} else {
		cb(null, true);
	}
};

export const multerInterceptorConfig = (
	foldername: string,
	filetype: string[] = [
		'image/png',
		'image/jpg',
		'image/jpeg',
		'video/mp4',
		'video/webm',
		'video/ogg',
		'application/pdf',
		'.csv',
		'.xlsx',
		'.xlsb',
		'.xlsm',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-excel',
		// '.doc',
		// '.docx',
		// 'application/msword',
		// 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	],
	fileSize = 1000,
	type: any = null,
	value: string | 'body' | 'query' | 'params' = 'body',
) => {
	const upload = multer({
		storage: storage(foldername),
		limits: {
			fileSize: fileSize * 1024,
		},
		fileFilter: async (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
			if (type) {
				try {
					cleanObj(_req[value]);
					_req[value] = await type.validateAsync(_req[value]);
				} catch (e) {
					const error: any = e;

					if (error.details) {
						const errorResponse = errorFilterValidator(error.details);
						return cb(new Error(errorResponse));
					}
					return cb(new Error('Something went wrong!'));
				}
			}
			checkFileType(file, cb, filetype);
		},
	});

	return upload;
};

export const multerUploadMeal = async (req: Request) => {
	const files: any = req.files;
	const mealData = Object.values(files).map((e: { fieldname: string }) => {
		return { ...e, meal: Number(e.fieldname.match(/\d+/)[0]) };
	});
	const chainedRes = _.groupBy(mealData, 'meal');
	req.body.meal = req.body.meal.map((e: any, index: string | number) => ({ ...e, attachments: chainedRes[index] }));
	return chainedRes;
};
