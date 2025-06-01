import db from '@/models';
import EmployeeRepo from '@/repository/employee.repository';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import TimesheetRepo from '@/repository/timesheet.repository';
import { parse } from '@/utils/common.util';

const empRepo = new EmployeeRepo();
const TimesheetRepo1 = new TimesheetRepo();
const reliquatCalculationRepo = new ReliquatCalculationRepo();
const errorArray = [];

function simulateAsyncOperation(employee) {
	return new Promise(async (resolve) => {
		const transaction = await db.transaction();
		try {
			console.log(
				'info',
				'------------------------- Start Reliquat Calculation Migration -------------------------',
				employee.id,
			);

			let isExist = await TimesheetRepo1.getAllTimesheet({
				where: {
					employeeId: employee.id,
				},
				order: [['startDate', 'asc']],
				transaction,
			});

			isExist = parse(isExist);
			// vdfv
			if (isExist) {
				await reliquatCalculationRepo.deleteData({
					where: {
						employeeId: employee?.id,
					},
					transaction,
					force: true,
				});

				for (const iterator of isExist) {
					console.log('info', `Processing timesheet ${iterator.id}...`);
					try {
						await reliquatCalculationRepo.addReliquatCalculationService(
							{
								employeeId: String(iterator?.employeeId),
								timesheetId: iterator?.id,
								userId: iterator?.createdBy,
							},
							transaction,
						);
						console.log('info', `Timesheet ${iterator.id} processed.`);
					} catch (error) {
						console.error(`Error processing timesheet ${iterator.id}:`, error);
						errorArray.push({ employeeId: iterator?.employeeId, timesheetId: iterator?.id, error: error });
					}
					console.log('info', `Timesheet ${iterator.id} processed.`);
				}

				await transaction.commit();

				console.log(
					'info',
					'------------------------- complete Reliquat Calculation Migration -------------------------',
					employee.id,
				);
				resolve(true);
			} else {
				resolve(true);
			}
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			errorArray.push({ error: error, employeeId: employee?.id }); // Store error in errorArray
			resolve(true);
		}
	});
}

async function runOperationsForEmployees() {
	const employeeData = await empRepo.getAll({
		where: {
			deletedAt: null,
		},
	});
	const parsedEmployeeData = parse(employeeData);
	for (const employee of parsedEmployeeData) {
		try {
			const success = await simulateAsyncOperation(employee);
			if (!success) {
				errorArray.push({ employee: employee.id }); // If success is false, add employee to errorArray
			}
		} catch (error) {
			console.error('An error occurred:', error);
			errorArray.push({ employeeId: employee.id, error: error });
		}
	}
}

// Example usage
// const employees = ['John', 'Alice', 'Bob'];

runOperationsForEmployees()
	.then(() => {
		console.log('All operations completed successfully.');
		console.log('Errors occurred for:', errorArray);
	})
	.catch((error) => {
		console.error('An error occurred:', error);
	});
