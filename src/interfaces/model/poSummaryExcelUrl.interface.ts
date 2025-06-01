export interface PoSummaryExcelUrlAttributes {
  id?: number;
  clientId: number;
  // segment: number;
  // subSegment: number;
  poSummaryUrl: string;
  startDate: string;
  endDate: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}
