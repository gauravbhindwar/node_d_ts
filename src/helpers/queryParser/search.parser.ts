import { Request } from 'express';
import _ from 'lodash';
import { Op } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { QueryParserArgs } from './query.parser';

export default class SearchParser<M extends Model> {
	readonly req: Request;
	readonly model: ModelCtor<M>;
	constructor({ request, model }: QueryParserArgs<M>) {
		this.req = request;
		this.model = model;
	}

	private readonly _getQuery = (searchText: string, searchFields: string[]) => {
		const query = { [Op.or as symbol]: [] };
		searchFields.forEach((field) => {
			switch (this.getFieldType(field)) {
				case 'STRING':
				case 'TEXT':
					query[Op.or].push({ [field]: { [Op.like]: `%${searchText}%` } });
					break;
				case 'INT':
					query[Op.or].push({ [field]: { [Op.contains]: parseInt(searchText) } });
					break;
				case 'FLOAT':
					query[Op.or].push({ [field]: { [Op.contains]: parseFloat(searchText) } });
					break;
			}
		});

		return query;
	};

	private readonly getFieldType = (field: string) => {
		return this.model.getAttributes()?.[field]?.type?.constructor?.name;
	};

	readonly getQuery = () => {
		const searchText = _.get(this.req.query, 'searchText', '') as string;
		const searchFields = _.get(this.req.query, 'searchFields', '') as string;

		const validSearchFields = this.validateFields(searchFields);

		if (searchText && validSearchFields?.length) {
			return this._getQuery(searchText, validSearchFields);
		}
	};

	private readonly validateFields = (searchFields: string) => {
		return searchFields.split(',').filter((field: string) => this.model.getAttributes()[field]);
	};
}
