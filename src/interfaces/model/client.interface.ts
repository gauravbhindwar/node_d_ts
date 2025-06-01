export enum clientTypeEnum {
  CLIENT = "client",
  SUB = "sub-client",
}

export interface IClientCreate {
  code: string;
  email: string;
  name: string;
  country: string;
  timezone?: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  slug?: string;
  weekendDays?: string;
  isAllDays?: boolean;
  autoUpdateEndDate?: number;
  timeSheetStartDay: number;
  approvalEmail?: string;
  isShowPrices?: boolean;
  isShowCostCenter?: boolean;
  isShowCatalogueNo?: boolean;
  titreDeConge?: string;
  isResetBalance?: boolean;
  startMonthBack: number;
  medicalEmailSubmission?: string;
  medicalEmailToday?: string;
  medicalEmailMonthly?: string;
  isShowSegmentName?: boolean;
  isShowNSS?: boolean;
  isShowCarteChifa?: boolean;
  isShowSalaryInfo?: boolean;
  isShowRotation?: boolean;
  isShowBalance?: boolean;
  logo?: string;
  stampLogo?: string;
  segment?: string;
  subSegment?: string;
  bonusType?: string;
  isCountCR?: boolean;
  contractN?: string;
  contractTagline?: string;
  address?: string;
  currency?: string;
  clienttype?: string; //new clienttype filed added
  parentClientId?: number; //new  parentClientid field added
  taxAmount?:number;
  leaveTypes?: [number];
  overtime_bonus?: [];

}
export interface ClientAttributes {
  id?: number;
  loginUserId?: number;
  code?: string;
  country?: string;
  timezone?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  autoUpdateEndDate?: number;
  timeSheetStartDay?: number;
  weekendDays?: string;
  isAllDays?: boolean;
  approvalEmail?: string;
  isShowPrices?: boolean;
  isShowCostCenter?: boolean;
  isShowCatalogueNo?: boolean;
  titreDeConge?: string;
  isResetBalance?: boolean;
  startMonthBack?: number;
  medicalEmailSubmission?: string;
  medicalEmailToday?: string;
  medicalEmailMonthly?: string;
  isShowSegmentName?: boolean;
  isShowNSS?: boolean;
  isShowCarteChifa?: boolean;
  isShowSalaryInfo?: boolean;
  isShowRotation?: boolean;
  isShowBalance?: boolean;
  logo?: string;
  stampLogo?: string;
  segment?: string;
  subSegment?: string;
  bonusType?: string;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  slug?: string;
  oldClientId?: string | null;
  isCountCR?: boolean;
  contractN?: string;
  contractTagline?: string;
  address?: string;
  currency?: string;
  clienttype?: string; 
  parentClientId?: number;
  clientName?: string;
  clientEmail?: string;
  updatedatutc?:string;
  createdatutc?:string;
  deletedatutc?:string;
  startdateatutc?:string;
  enddateatutc?:string;
  taxAmount?:number;
  leaveTypes?: [number];
}
