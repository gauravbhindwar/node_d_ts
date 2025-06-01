import TimesheetController from '@/controllers/timesheet.controller';
import { QueueAttributes, queueStatus } from '@/interfaces/model/queue.interface';
import db from '@/models';
import Queue from '@/models/queue.model';
import ClientRepo from '@/repository/client.repository';
import moment from 'moment';
import { Transaction } from 'sequelize';

export default class Queues {
	private TimesheetController = new TimesheetController();
	private clientRepo = new ClientRepo();

	async processQueue({ data }: { data: QueueAttributes }) {
		const transaction = await db.transaction();
		try {
			const limitTakes = 3;
  
			let takeCount = data?.totalTakes + 1;
			if (data?.status === queueStatus.INPROGRESS) {
				takeCount = data?.totalTakes;
				try {console.log('step 2');
					await this.processQueueData({ data, transaction });
					await Queue.update(
						{ status: queueStatus.COMPLETED, endDate: moment().toDate() },
						{
							where: {
								id: data?.id,
							},
							transaction,
						},
					);
				} catch (error) {
					const parts = error.message.split('Error:');
					const errorPart = parts.find((part) => part.trim() !== '');
					const finalErrorMessage = errorPart ? errorPart.trim() : 'Unknown Error';
					if (takeCount === limitTakes) {
						await Queue.update(
							{ status: queueStatus.FAILED, error: finalErrorMessage, endDate: moment().toDate() },
							{
								where: {
									id: data?.id,
								},
								transaction,
							},
						);
					} else {
						await Queue.update(
							{ status: queueStatus.RETAKE },
							{
								where: {
									id: data?.id,
								},
								transaction,
							},
						);
					}
				}
			}
			if (data?.status === queueStatus.RETAKE && data?.totalTakes < limitTakes) {
				await Queue.update(
					{ status: queueStatus.INPROGRESS, totalTakes: takeCount },
					{
						where: {
							id: data?.id,
						},
						// transaction,
					},
				);
				try {
					await this.processQueueData({ data, transaction });
					await Queue.update(
						{ status: queueStatus.COMPLETED, endDate: moment().toDate() },
						{
							where: {
								id: data?.id,
							},
							transaction,
						},
					);
				} catch (error) {
					const parts = error.message.split('Error:');
					const errorPart = parts.find((part) => part.trim() !== '');
					const finalErrorMessage = errorPart ? errorPart.trim() : 'Unknown Error';
					if (takeCount === limitTakes) {
						await Queue.update(
							{ status: queueStatus.FAILED, error: finalErrorMessage, endDate: moment().toDate() },
							{
								where: {
									id: data?.id,
								},
								transaction,
							},
						);
					} else {
						await Queue.update(
							{ status: queueStatus.RETAKE },
							{
								where: {
									id: data?.id,
								},
								transaction,
							},
						);
					}
				}
			}
			if (data?.status === queueStatus.PENDING) {
				await Queue.update(
					{ status: queueStatus.INPROGRESS, totalTakes: takeCount, startDate: moment().toDate() },
					{
						where: {
							id: data?.id,
						},
						// transaction,
					},
				);
				try {
					await this.processQueueData({ data, transaction });
					await Queue.update(
						{ status: queueStatus.COMPLETED, endDate: moment().toDate() },
						{
							where: {
								id: data?.id,
							},
							transaction,
						},
					);
				} catch (error) {
					await Queue.update(
						{ status: queueStatus.RETAKE },
						{
							where: {
								id: data?.id,
							},
							transaction,
						},
					);
				}
			}
			await transaction.commit();
			return true;
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			throw new Error(error);
		}
	}

	async processQueueData({ data, transaction }: { data: QueueAttributes; transaction: Transaction }) {
		try {
			switch (data?.processName) {
				case 'TIMESHEET_EXTENSION': {
					await this.TimesheetController.createTimesheet(
						{
							clientId: data?.clientId,
							employeeIds: [data?.employeeId],
							user: { id: data?.updatedBy },
							isClientExtendTimesheet: true,
							disableFunction: ['reliquet'],
						},
						transaction,
					);
					return true;
				}
				default:
					break;
			}
			// if (data?.processName === 'TIMESHEET_EXTENSION') {
			// 	await this.TimesheetController.createTimesheet(
			// 		{
			// 			clientId: data?.clientId,
			// 			employeeIds: [data?.employeeId],
			// 			user: { id: data?.updatedBy },
			// 			isClientExtendTimesheet: true,
			// 		},
			// 		transaction,
			// 	);
			// }
		} catch (error) {
			throw new Error(error);
		}
	}
}
