import db from '../../../models';
import SearchQuery from './search.query';

export interface GlobalSearchQueryParams {
	offset: number;
	limit: number;
	searchText: string;
}

class GlobalSearchQuery extends SearchQuery {
	constructor(options: GlobalSearchQueryParams) {
		super({
			limit: options.limit,
			offset: options.offset,
			searchText: options.searchText,
		});
	}

	// this query for search from lead, deal, contact and account table
	readonly getLeadDealAccContSearchQuery = async () => {
		const rows = await db.query(`
      SELECT id,name,model_name,is_deal
      FROM
      lead_account_contact
      WHERE AND deleted_at IS NULL AND
      LOWER(name) LIKE LOWER('%${this.searchText}%')
      OFFSET ${this.offset}
      LIMIT ${this.limit}
      `);

		const total: any = await db.query(`
      SELECT COUNT(*)::Int
      FROM
      lead_account_contact
      WHERE deleted_at IS NULL AND
      LOWER(name) LIKE LOWER('%${this.searchText}%')
      `);

		return { rows: rows?.[0] || [], total: total?.[0]?.[0]?.count || 0 };
	};
}

export default GlobalSearchQuery;
