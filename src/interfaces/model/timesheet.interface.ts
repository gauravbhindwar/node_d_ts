export interface ITimesheetCreate {
  status?: string;
  clientId?: number;
  segmentId?: number;
  subSegmentId?: number;
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
  dbKey?: string;
  oldTimesheetId?: string;
}

export interface TimesheetAttributes {
  id?: number;
  status: string;
  clientId: number;
  segmentId?: number;
  subSegmentId?: number;
  employeeId?: number;
  startDate: Date;
  endDate: Date;
  totalDays?: number;
  dbKey?: string;
  oldTimesheetId?: string;
  approvedAt?: Date | string;
  approvedBy?: number;
  unApprovedAt?: Date | string;
  unApprovedBy?: number;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
  requestedUserId?: number;
  requestedDate?: string;
}

export interface TimesheetPDFAttributes {
  replacement: {
    mailHeader: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
    tableHeader: string;
    tableData: number[];
    timesheetPeriod: string;
    logourl: string;
    message: string;
  };
  pdfData: {
    data;
    pdfName: string;
    title: string;
    attribute: boolean;
    resizeHeaderFooter: boolean;
    stampLogo: string | null;
    footerContent: string;
    footer: string;
    isTimesheetPdf: boolean;
  };
  emails: string[];
  pdfPath: string;
}
