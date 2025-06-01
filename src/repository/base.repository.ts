import { Optional } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import {
	BulkCreateArgs,
	BulkCreateOptions,
	CountArgs,
	CreateArgs,
	CreateOneOptions,
	DeleteArgs,
	FindAllArgs,
	FindAndCountAllArgs,
	FindOneArgs,
	RestoreArgs,
	UpdateOneArgs,
	UpdateOneOptions,
	UpsertOptions,
} from '../interfaces/general/database.interface';
import db from '../models';

export default abstract class BaseRepository<M extends Model> {
	readonly DBModel: ModelCtor<M>;

	constructor(readonly modelName: string) {
		this.DBModel = <ModelCtor<M>>db.models[modelName];
	}

	readonly get = async (data: Optional<FindOneArgs<M>, 'rejectOnEmpty'>) => {
		return this.DBModel.findOne({ ...data, rejectOnEmpty: false });
	};

	readonly getAll = async (data: FindAllArgs<M>) => {
		return this.DBModel.findAll({ ...data });
	};

	readonly create = async (data: CreateArgs<M>, options?: CreateOneOptions<M>) => {
		return this.DBModel.create(data, options);
	};

	readonly getCount = async (options?: CountArgs<M>) => {
		return this.DBModel.count(options);
	};

	readonly bulkCreate = async (data: BulkCreateArgs<M>, options?: BulkCreateOptions<M>) => {
		return this.DBModel.bulkCreate(data, options);
	};

	readonly update = async (data: UpdateOneArgs<M>, options?: Optional<UpdateOneOptions<M>, 'returning'>) => {
		return this.DBModel.update(data, { returning: true, individualHooks: false, ...options });
	};

	readonly upsert = async (data: CreateArgs<M>, options?: UpsertOptions<M>) => {
		return this.DBModel.upsert(data, { returning: true, ...options });
	};

	readonly deleteData = async (options: DeleteArgs<M>) => {
		return this.DBModel.destroy(options);
	};

	readonly restore = async (options: RestoreArgs<M>) => {
		return this.DBModel.restore(options);
	};

	readonly getAllData = async (options: FindAndCountAllArgs<M>) => {
		return this.DBModel.findAndCountAll({ ...options, distinct: true });
	};
}
