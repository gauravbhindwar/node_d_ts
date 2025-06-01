import { RequiredKey } from './common.interface';

export interface NotificationAttributes {
	id: number;
	userId: number;
	title?: string;
	message?: string;
	isRead?: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}

export type RequiredNotificationAttributes = RequiredKey<NotificationAttributes, 'userId'>;
