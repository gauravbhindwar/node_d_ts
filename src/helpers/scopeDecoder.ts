import { parse } from 'qs';

export default (scopesString: string | string[]) => {
	if (Array.isArray(scopesString)) {
		return scopesString;
	}
	const decodedScopes = parse(`scope=${scopesString}`);
	return (decodedScopes?.scope as string)?.split(' ');
};
