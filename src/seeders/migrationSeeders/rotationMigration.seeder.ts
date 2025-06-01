import Rotation from '@/models/rotation.model';
import mssqldb from '@/mssqldb';
import RotationRepo from '@/repository/rotation.repository';

const rotationRepo = new RotationRepo();
interface IRotationData {
	Id: number;
	ClientId: number;
	Name: string;
	WeeksOn: number | null;
	WeeksOff: number | null;
	Resident: boolean;
	Monday: boolean;
	Tuesday: boolean;
	Wednesday: boolean;
	Thursday: boolean;
	Friday: boolean;
	Saturday: boolean;
	Sunday: boolean;
	WeekendBonus: boolean;
	OvertimeBonus: boolean;
}

async function processRotationData(data: IRotationData) {
	const weekOn = data.WeeksOn;
	const weekOff = data.WeeksOff;

	const daysOfWeek = {
		Monday: data.Monday,
		Tuesday: data.Tuesday,
		Wednesday: data.Wednesday,
		Thursday: data.Thursday,
		Friday: data.Friday,
		Saturday: data.Saturday,
		Sunday: data.Sunday,
	};

	const workedDays = Object.keys(daysOfWeek).filter((day) => daysOfWeek[day]);

	const daysWorked = workedDays.join(',');
	const isAllDays = workedDays.length === 7;

	let description = '';

	if (data.Resident) {
		if (weekOff != undefined) {
			description = `Resident ${weekOff} days off, working ${isAllDays ? 'all days' : daysWorked}`;
		}
	} else if (weekOn != undefined && weekOff != undefined) {
		description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
	}

	return {
		name: data.Name,
		weekOn,
		weekOff,
		isResident: data.Resident,
		daysWorked: daysWorked || null,
		isAllDays,
		isWeekendBonus: data.WeekendBonus,
		isOvertimeBonus: data.OvertimeBonus,
		description: description || null,
	};
}

async function processRotationRecords(records) {
	for (const data of records) {
		const rotationData = await processRotationData(data);
		const isExistRotation = await rotationRepo.get({ where: { ...rotationData } });

		if (!isExistRotation) {
			await Rotation.create(rotationData);
		} else {
			await Rotation.update(rotationData, { where: { id: isExistRotation.id } });
		}
	}
}

(async function injectFolder() {
	// Start Rotation Migration *********************************
	const result = await mssqldb.query('SELECT * FROM rd_Rotation');
	console.log('info', '------------------------- Start Rotation Migration -------------------------');
	if (result.length) {
		await processRotationRecords(result[0] as IRotationData[]);
	}
	console.log('info', '------------------------- End Rotation Migration -------------------------');
	// End Rotation Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
