export class HttpException extends Error {
	public status: number;
	public message: string;
	public toast: boolean;
	public data: any | {};

	constructor(status: number, message: string, data?: any, toast = false) {
		super(message);
		this.data = data;
		this.status = status || 400;
		this.message = message;
		this.toast = toast;
	}
}
