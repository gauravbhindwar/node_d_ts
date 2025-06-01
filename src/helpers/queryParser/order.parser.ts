import { parseStr } from './sort-string.parser';

export default class OrderParser {
	constructor(readonly request: string) {
		//
	}

	readonly getQuery = () => {
		return this._getQuery(this.request);
	};

	private readonly _getQuery = (sort: string): [string, string][] => {
		return parseStr(sort || '').map((fraction: string) => {
			return [
				fraction.startsWith('-') ? fraction.slice(1, fraction.length) : fraction,
				fraction.startsWith('-') ? 'DESC' : 'ASC',
			];
		});
	};
}
