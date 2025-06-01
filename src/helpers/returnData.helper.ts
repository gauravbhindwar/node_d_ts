import { generalResponsePromise } from 'interfaces/general/general.interface';

export const initiateReturn = async () => {
	return {
		data: null,
		message: 'Something went wrong',
		toast: false,
		set values(data: generalResponsePromise) {
			this.data = data.data;
			this.message = data.message;
			this.toast = data.toast;
		},
	};
};
