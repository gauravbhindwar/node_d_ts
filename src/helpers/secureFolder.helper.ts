import FileToken from '@/models/fileToken.model';
import CryptoJS from 'crypto-js';

export const secureFileToken = async (fileName) => {
	try {
		const randomToken = CryptoJS.lib.WordArray.random(16);
		const token = CryptoJS.enc.Hex.stringify(randomToken);
		await FileToken.create({ token: token });
		// return `${fileName}?token=${generateToken}`;
		return `${fileName}?token=${token}`;
	} catch (e) {
		console.log(e);
	}
};
