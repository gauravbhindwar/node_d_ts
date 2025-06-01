import { Request } from 'express';
import XLSX from 'xlsx';
import { s3BucketUploader } from './s3.helper';

export const isNumeric = (n: any) => {
	return n && !isNaN(parseFloat(n)) && isFinite(n);
};

export const cleanObj = (obj: { [key: string]: any }) => {
	Object.keys(obj).forEach((key: string) => {
		try {
			if (obj[key] === '') {
				obj[key] = null;
			} else if (typeof obj[key] === 'string') {
				obj[key] = JSON.parse(obj[key]);
			}
		} catch (err) {
			// do nothing
		}
	});
	return obj;
};

export const dateFormat = (value: string | Date | null | undefined) => {
	if (value) {
		if (!Number.isNaN(new Date(value).getTime())) {
			return new Date(value);
		}
		return null;
	}
	return null;
};

export const checkParamId = (value: string | number, moduleName: string) => {
	const param = Number(value);
	if (!param || isNaN(param) || param === undefined) {
		throw new Error(`${moduleName} id is missing`);
	}
	return param;
};

export const getPaginationParams = (req: Request) => {
	const page: number = req.query.page ? Number(req.query.page) : 1;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const clientId = req.query.clientId ? req.query.clientId : undefined;
	const employeeId = req.query.employeeId ? req.query.employeeId : undefined;
	const search = req.query.search && req.query.search.toString() !== '' ? req.query.search.toString() : '';
	const skip: number = (Number(page) - 1) * Number(limit);
	const filter = req.query.filter ? req.query.filter : false;
	const id = req.query.id ? Number(req.query.id) : null;
	const listView = !!req.query.view;
	return { page, limit, search, skip, filter, id, listView, clientId, employeeId };
};

export const getDate = (date: any) => {
	const dateOffset = 24 * 60 * 60 * 1000 * 1; //1 days
	const myDate = new Date(date);
	myDate.setTime(myDate.getTime() - dateOffset);
	return myDate.toISOString();
};

export const numDate = (date: number) => {
	const baseDate = new Date(1899, 11, 30, 0, 0, 0);
	const dateTime = baseDate.getTime() + (new Date().getTimezoneOffset() - baseDate.getTimezoneOffset()) * 60000;
	const dataTimeItem = new Date();
	dataTimeItem.setTime(date * 24 * 60 * 60 * 1000 + dateTime + 10000);
	return dataTimeItem.toISOString();
};

export const getMonthDateRange = async (year: number, month: number) => {
	const moment = require('moment');

	// month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
	// array is 'year', 'month', 'day', etc
	const startDate = moment([year, month - 1]);

	// Clone the value before .endOf()
	const endDate = moment(startDate).endOf('month');

	// make sure to call toDate() for plain JavaScript date type
	return { start: startDate.toISOString(), end: endDate.toISOString() };
};

export const getPageAndSize = (req: Request) => {
	const page: number | null = req.query.page ? Number(req.query.page) : null;
	const limit: number | null = req.query.limit ? Number(req.query.limit) : null;
	return { page, limit };
};

export const getFiles = (req: Request) => {
	const temp: { [key: string]: string | string[] } = {};

	if (req.files) {
		Object.entries(req.files).forEach((e) => {
			const [key, value] = e;

			if (value) {
				if (value.length === 1) {
					temp[key] = value[0].path.replace('public/', '');
				} else if (value.length > 1) {
					value.forEach((item) => {
						temp[key] = temp[key]
							? [...temp[key], item.path.replace('public/', '')]
							: [item.path.replace('public/', '')];
					});
				}
			}
		});
	}
	return temp;
};

export const generateFileName = (prefix?: string, suffix?:string) => {
  const now = new Date();
  // Format date and time
  const year = now.getFullYear();
  const month = now.toLocaleString('default', { month: 'short' }); // Get month in short format (e.g., Jul)
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Construct the string
  const fileName = `${prefix}_${suffix}_${year}-${month}-${day}.${hours}.${minutes}.${seconds}`;

  return fileName;
}


export const sortByNestedProperty = async(array: any) => {
    return array.sort((a, b) => {
      if (a?.loginUserData?.name < b?.loginUserData?.name) {
        return -1;
      }
      if (a?.loginUserData?.name > b?.loginUserData?.name) {
        return 1;
      }
      return 0;
    });
  };

export const applyCustomPagination = async(array: any, query: any) => {
    const { page, limit } = query;    
    let data = array;
    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      data = data.slice(skip, skip + parseInt(limit));
    }
    return data;
  };

export const applyCustomlimitsearchsorting = async(array: any, query: any) => {
    const { page, limit, search, segmentId, subSegmentId } = query;

    let data = null;
    data = search
      ? array.filter((item: any) => {
          return item?.loginUserData?.name
            .toLowerCase()
            .includes(search.toLowerCase());
        })
      : array;
    data = segmentId
      ? data.filter((item: any) => item.segmentId === segmentId)
      : data;

    data = subSegmentId
      ? data.filter((item: any) => item.subSegmentId === subSegmentId)
      : data;

    data = await sortByNestedProperty(data);

    data = await applyCustomPagination(data, query);

    return data;
  };


export const createExcelFile = async(worksheetDataArray: any, folderName: string, fileName: string, sheetName = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(worksheetDataArray); // Create worksheet from data array

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  const colWidths = Array(Object.keys(worksheetDataArray[0]).length).fill({ width: 30 }); // Adjust the width value as needed
  ws['!cols'] = colWidths;

  // Apply basic styling to the headers
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Get cell address (first row = header)
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "#E3D6D6" } },
          fill: { fgColor: { rgb: "#560504" } },
          alignment: { vertical: 'center', horizontal: 'center' },
      };
  }

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write the workbook to a buffer
  const wbBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });



  // // Path for storing the file
  // const publicFolder = path.join(__dirname, "../../public/"+folderName);
  // folderExistCheck(publicFolder); // Ensure folder exists

  // const filePath = path.join(publicFolder, fileName);

  // Write the workbook to the file
  // XLSX.writeFile(wb, filePath);
  const params = {
    path: `${folderName}/${fileName}`,
    content: wbBuffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  const s3BucketFile = await s3BucketUploader(params);

  return s3BucketFile.fileUrl // Return the file path
}

// export const publicPathCreator = (publickPath: string) => {
//   return `${process.env.SERVER_URL || 'http://localhost:8001/'}${publickPath}`;
// }
