import _ from 'lodash';
import db from 'models';
import { Model, ModelCtor } from 'sequelize-typescript';

export const setInstance = <M extends Model & { _isAttribute?: (key: string) => boolean }>(
	data: Record<string, any>,
	model: M,
) => {
	Object.keys(data || {}).forEach((key) => {
		if (!_.isUndefined(data?.[key]) && model?._isAttribute?.(key)) {
			model[key] = data?.[key];
		}
	});
	return model;
};

export const getModel = <M extends Model>(modelName: string) => {
	return <ModelCtor<M>>db.models[modelName];
};

export const getAssociatedModel = <M extends Model>(key: string, model: ModelCtor<M>) => {
	const modelName = model?.associations?.[key]?.target?.name;
	if (modelName) {
		return db.models?.[modelName];
	}
};
