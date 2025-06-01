export interface ISubSegmentCreate {
	code: string;
	name: string;
	segmentId: number;
	costCentre: string;
	fridayBonus: number;
	saturdayBonus: number;
	overtime01Bonus: number;
	overtime02Bonus: number;
	slug?: string;
	isActive: boolean;
}

export interface SubSegmentAttributes {
	id?: number;
	segmentId: number;
	code: string;
	name: string;
	costCentre: string;
	fridayBonus: number;
	saturdayBonus: number;
	overtime01Bonus: number;
	overtime02Bonus: number;
	createdBy: number;
	updatedAt: Date;
	updatedBy: number;
	deletedAt: Date;
	slug?: string;
	isActive: boolean;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
