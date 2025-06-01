import { Request } from 'express';
import _ from 'lodash';
import { Op, OrderItem } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import IncludeParser from './include.parser';
import OrderParser from './order.parser';
import SearchParser from './search.parser';
import WhereParser from './where.parser';

export interface QueryParserArgs<M extends Model> {
	request: Request;
	model: ModelCtor<M>;
}

export class QueryParser<M extends Model> {
	readonly req: Request;
	readonly model: ModelCtor<M>;
	constructor({ request, model }: QueryParserArgs<M>) {
		this.req = request;
		this.model = model;
	}

	readonly getFullQuery = (target: Record<string, any> = {}) => {
		return Object.assign({}, target, {
			where: this.getWhereQuery(),
			order: this.getOrderQuery(),
			limit: this.getLimitQuery(),
			offset: this.getOffsetQuery(),
			include: this.getIncludeQuery(),
			attributes: this.getSelectQuery(),
			subQuery: this.getSubQuery(),
		});
	};

	private getSubQuery = () => {
		const subQuery = _.get(this.req.query, 'subQuery', 'true') as string | boolean;

		if (subQuery && typeof subQuery === 'string') {
			return subQuery === 'false' ? false : undefined;
		}

		return !!subQuery;
	};

	private readonly getWhereQuery = () => {
		const whereQuery = new WhereParser({
			request: this.req.query?.q as Record<string | symbol, any>,
			model: this.model,
		})?.getQuery();
		const searchQuery = new SearchParser({ model: this.model, request: this.req }).getQuery();

		if (whereQuery?.[Op.or]?.length || searchQuery?.[Op.or]?.length) {
			whereQuery[Op.or] = _.concat(whereQuery?.[Op.or] || [], searchQuery?.[Op.or] || []);
		}
		return whereQuery;
	};

	private readonly getOrderQuery = (): OrderItem[] => {
		if (typeof this.req.query?.sort === 'string') {
			return new OrderParser(this.req.query.sort)?.getQuery();
		}
		return [['startDate', 'DESC']];
	};

	private readonly getSelectQuery = () => {
		if (this.req.query.select && typeof this.req.query.select === 'string') {
			return this.req.query?.select.split(',');
		}
	};

	private readonly getLimitQuery = () => {
		return +_.get(this.req.query, 'limit', 10);
	};

	private readonly getIncludeQuery = () => {
		return new IncludeParser({
			input: this.req.query.include as Record<string, any>,
			model: this.model,
		})?.getQuery();
	};

	private readonly getOffsetQuery = () => {
		const page = +_.get(this.req.query, 'page', 1);
		const limit = +_.get(this.req.query, 'limit', 10);
		return limit * (page - 1);
	};
}
