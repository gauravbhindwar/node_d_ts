import Employee from '@/models/employee.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';
const employeeRepo = new EmployeeRepo();

(async function injectEmployee() {
	const result = await employeeRepo.getAll({ where: { deletedAt: null } });
	console.log('info', '------------------------- Start Employee Old Rotation Migration -------------------------');
	if (result.length) {
		// For Add Old Salary,Old Rotation and Old Segment in Multiple Salary, Rotation and Segment Table
		for (const data of result) {
			try {
				const isExistRotation = await EmployeeRotation.findOne({
					where: {
						deletedAt: null,
						employeeId: data?.id,
						rotationId: data.rotationId,
						date: moment(moment(data?.startDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					},
				});
				if (!isExistRotation && data.rotationId) {
					await EmployeeRotation.create({
						employeeId: data?.id,
						rotationId: data.rotationId,
						date: moment(moment(data?.startDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					});
				}
				const isExistSalary = await EmployeeSalary.findOne({
					where: {
						deletedAt: null,
						employeeId: data?.id,
						baseSalary: Number(data?.baseSalary ?? 0.0),
						monthlySalary: Number(data?.monthlySalary ?? 0.0),
						dailyCost: Number(data?.dailyCost ?? 0.0),
						startDate: data?.startDate ? moment(data?.startDate).toDate() : new Date(),
					},
				});
				if (!isExistSalary) {
					await EmployeeSalary.create({
						employeeId: data?.id,
						baseSalary: Number(data?.baseSalary ?? 0.0),
						monthlySalary: Number(data?.monthlySalary ?? 0.0),
						dailyCost: Number(data?.dailyCost ?? 0.0),
						startDate: data?.startDate ? moment(data?.startDate).toDate() : new Date(),
						endDate: null,
					});
				}
				const isExistSegment = await EmployeeSegment.findOne({
					where: {
						deletedAt: null,
						employeeId: data?.id,
						segmentId: data.segmentId,
						subSegmentId: data.subSegmentId,
						date: moment(moment(data?.startDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					},
				});
				if (!isExistSegment) {
					await EmployeeSegment.create({
						employeeId: data?.id,
						segmentId: data.segmentId,
						subSegmentId: data.subSegmentId,
						date: moment(moment(data?.startDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					});
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}

		// For Update Latest Data in Employee table and set Enddate of Employee Multiple Salary Data
		for (const data of result) {
			try {
				// Set Latest Rotation Data in Employee Table
				const latestRotation = await EmployeeRotation.findOne({
					where: { deletedAt: null, employeeId: data.id },
					order: [['date', 'desc']],
				});
				if (latestRotation)
					await Employee.update({ rotationId: latestRotation.rotationId }, { where: { id: data.id } });
				// Set Latest Salary Data in Employee Table
				const latestSalary = await EmployeeSalary.findOne({
					where: { deletedAt: null, employeeId: data.id },
					order: [['startDate', 'desc']],
				});
				if (latestSalary)
					await Employee.update(
						{
							baseSalary: latestSalary.baseSalary,
							dailyCost: latestSalary.dailyCost,
							monthlySalary: latestSalary.monthlySalary,
						},
						{ where: { id: data.id } },
					);
				// Set Latest Segment Data in Employee Table
				const latestSegment = await EmployeeSegment.findOne({
					where: { deletedAt: null, employeeId: data.id },
					order: [['date', 'desc']],
				});
				if (latestSegment)
					await Employee.update(
						{
							segmentId: latestSegment.segmentId,
							subSegmentId: latestSegment.subSegmentId,
						},
						{ where: { id: data.id } },
					);

				const isExistEmployeeSalary = await EmployeeSalary.findAll({
					where: { employeeId: data.id, deletedAt: null },
					order: [['startDate', 'asc']],
				});
				if (isExistEmployeeSalary.length > 1) {
					isExistEmployeeSalary.forEach(async (employeeSalary, index) => {
						if (isExistEmployeeSalary[index + 1]?.startDate && index < isExistEmployeeSalary.length - 1) {
							await EmployeeSalary.update(
								{
									endDate: moment(isExistEmployeeSalary[index + 1]?.startDate)
										.subtract(1, 'days')
										.toDate(),
								},
								{ where: { id: employeeSalary.id } },
							);
						}
					});
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Old Rotation Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
