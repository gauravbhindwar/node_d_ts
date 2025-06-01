import { messageStatus } from "../model/message.interface";

export interface generalResponsePromise {
  data: any;
  message: string;
  toast: boolean;
}

export interface IQueryParameters {
  page?: number;
  limit?: number;
  listView?: boolean;
  isExportPage?: boolean;
  isTerminatatedEmployee?: boolean;
  sort?: string;
  sortBy?: string;
  isActive?: boolean;
  clientId?: number;
  subClientId?: number;
  clientDropDownId?: number;
  rotationId?: number;
  contractTemplateId?: number;
  folderId?: number;
  segmentId?: number;
  subSegmentId?: number;
  imageId?: number;
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  driverId?: string;
  roleMessageUser?: string;
  requestId?: number;
  vehicleId?: number;
  statusValue?: messageStatus;
  transportStartDate?: string;
  transportEndDate?: string;
  activeTab?: string;
  clientIds?: string;
  activeStatus?: string;
  timesheetId?: number;
  search?: string;
  email?: string;
  segment?: string;
  subSegment?: string;
  roleId?: number;
  contractName?: string;
  country?: string;
  currency?: string;
  clienttype?: string;
  name?: string;
  parentClientId?: string;
  isResident?: boolean;
  createdBy?: number;
  requestType?: string;
  status?: string;
  module?: string;
  from?: string;
  to?: string;
  download?: string;
}
