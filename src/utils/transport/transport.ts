import TransportDriver from '@/models/transport.driver.model';
import TransportVehicle from '@/models/transport.vehicle.model';
import _ from 'lodash';

export const checkDate = async (item, table, unavailableDates) => {
	if (!_.isEmpty(item.unavailableDates)) {
		const data = [];
		item?.unavailableDates?.split(',').forEach((element) => {
			if (element !== unavailableDates) {
				data.push(element);
			}
		});

		const finalData = data.join(',');

		if (table === 'driverData') {
			await TransportDriver.update({ unavailableDates: finalData }, { where: { id: item.id } });
		}
		if (table === 'vehicleData') {
			await TransportVehicle.update({ unavailableDates: finalData }, { where: { id: item.id } });
		}
	}
};
