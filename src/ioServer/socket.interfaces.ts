export interface MessageInterface {
	senderId: number | string;
	message: string;
	roomId: number | string;
	file?: string | File;
	fileType?: string;
}
