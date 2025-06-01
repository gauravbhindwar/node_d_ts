import { RequiredKey } from './common.interface';

export interface IContractTemplateVersionCreate {
	id?: number;
	versionName?: string;
	description: string;
	clientId?: number;
	employeeId?: number;
	contractTemplateId: number;
	versionNo: number;
	isActive: boolean;
}
export interface PreviewContractTemplate {
    CONTRACT_NUMBER?: string;
    FIRST_NAME?: string;
    LAST_NAME?: string;
    DOB?: Date | string;
    PLACE_OF_BIRTH?: string;
    ADDRESS?: string;
    JOB_TITLE?: string;
    MONTHLY_SALARY?: string;
    HAS_BONUS?: string;
    BONUS_NAME?: string;
    BONUS_VALUE?: string;
    DURATION?: string;
    START_DATE?: Date | string;
    END_DATE?: Date | string;
    WEEK_ON?: string;
    WEEK_OFF?: string;

	Text1?: string;
	Text2?: string;
	Text3?: string;
	Text4?: string;
	Text5?: string;
	FAMILY_NAME?: string;
    First_name?: string;
    Tagline?: string;
    HR_Payroll_Text?: string;
    Salary_Text?: string;
    Date_Text?: Date | string;
    Contract_Text?: string;
    LRED_Text?: string;
}
export interface ContractTemplateVersionAttributes {
	id?: number;
	contractTemplateId: number;
	clientId: number;
	employeeId: number;
	versionName?: string;
	versionNo: number;
	description?: string;
	isActive: boolean;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredContractTemplateVersionAttributes = RequiredKey<ContractTemplateVersionAttributes, 'id'>;
