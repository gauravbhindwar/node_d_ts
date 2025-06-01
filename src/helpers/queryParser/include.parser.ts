import { getAssociatedModel } from 'helpers/sequelize.helper';
import { GetIncludeQuery, IncludeParams } from 'interfaces/general/sequelize.interface';
import _ from 'lodash';
import { Model, ModelCtor } from 'sequelize-typescript';
import { hasOwnProperty } from 'utils/common.util';
import WhereParser from './where.parser';

export default class IncludeParser<M extends Model> {
	readonly model: ModelCtor<M>;
	readonly includeInput: IncludeParams;

	constructor(data: GetIncludeQuery<M>) {
		this.model = data.model;
		this.includeInput = data.input;
	}

	readonly getQuery = () => {
		return this._getIncludeQuery({
			model: this.model,
			input: this.includeInput,
		});
	};

	private readonly getIncludeSelect = (value: string | { select?: string }) => {
		if (typeof value === 'string') {
			return value.split(',');
		}

		if (typeof value !== 'string' && hasOwnProperty(value, 'select')) {
			return value.select.split(',');
		}

		return [];
	};

	private readonly checkBoolean = (value: string | boolean) => {
		if (value && typeof value === 'string') {
			return value === 'true';
		}

		return value;
	};

	readonly _getIncludeQuery = (includeQuery: GetIncludeQuery<M>) => {
		const { input, model } = includeQuery;
		const result = [];
		_.forEach(input, (value, key) => {
			let includeObj: Record<string, any> = {};
			const includeModel = getAssociatedModel(key, model);

			if (includeModel) {
				if (typeof value === 'string') {
					includeObj = {
						model: includeModel,
						as: key,
						required: false,
						...(value !== 'all' && { attributes: this.getIncludeSelect(value) }),
					};
				}

				if (typeof value !== 'string') {
					includeObj = {
						model: includeModel,
						required: this.checkBoolean(value?.required) || false,
						separate: this.checkBoolean(value?.separate) || false,
						paranoid: this.checkBoolean(value?.paranoid) || true,
						where: value?.q && new WhereParser({ request: value?.q, model: includeModel as ModelCtor<M> }).getQuery(),
						as: key,
						...(value?.select && { attributes: this.getIncludeSelect(value) }),
					};

					if (value.include) {
						includeObj.include = this._getIncludeQuery({
							input: value.include,
							model: includeModel as ModelCtor<M>,
						});
					}
				}
				result.push(includeObj);
			}
		});

		return result;
	};
}
