export interface SearchQueryParams {
	readonly limit: number;
	readonly offset: number;
	readonly searchText: string;
}

export abstract class SearchQuery {
	protected readonly limit: number;
	protected readonly offset: number;
	protected readonly searchText: string;
	constructor({ limit, offset, searchText }: SearchQueryParams) {
		this.limit = limit;
		this.offset = offset;
		this.searchText = searchText;
	}
}

export default SearchQuery;
