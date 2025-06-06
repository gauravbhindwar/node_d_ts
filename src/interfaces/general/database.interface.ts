import {
	Attributes,
	BulkCreateOptions as BulkCreateOptionsAlias,
	CountOptions,
	CreateOptions,
	CreationAttributes,
	DestroyOptions,
	FindAndCountOptions,
	FindOptions,
	NonNullFindOptions,
	RestoreOptions,
	UpdateOptions,
	UpsertOptions as UpsertOptionsAlias,
} from 'sequelize';
import { Model } from 'sequelize-typescript';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export type FindOneArgs<M extends Model> = NonNullFindOptions<Attributes<M>>;

export type FindAllArgs<M extends Model> = FindOptions<Attributes<M>>;

export type CreateArgs<M extends Model> = CreationAttributes<M>;

export type BulkCreateArgs<M extends Model> = ReadonlyArray<CreationAttributes<M>>;

export type BulkCreateOptions<M extends Model> = BulkCreateOptionsAlias<Attributes<M>>;

export type FindAndCountAllArgs<M extends Model> = Omit<FindAndCountOptions<Attributes<M>>, 'group'>;

export type CreateOneOptions<M extends Model> = CreateOptions<Attributes<M>>;

export type UpdateOneArgs<M extends Model> = {
	[key in keyof Attributes<M>]?: Attributes<M>[key] | Fn | Col | Literal;
};

export type UpdateOneOptions<M extends Model> = Omit<UpdateOptions<Attributes<M>>, 'returning'> & {
	returning: Exclude<UpdateOptions<Attributes<M>>['returning'], undefined | false>;
};

export type UpsertOptions<M extends Model> = UpsertOptionsAlias<Attributes<M>>;

export type DeleteArgs<M extends Model> = DestroyOptions<Attributes<M>>;

export type RestoreArgs<M extends Model> = RestoreOptions<Attributes<M>>;

export type CountArgs<M extends Model> = CountOptions<Attributes<M>>;
