import { NODE_ENV } from 'config';
import scopeDecoder from 'helpers/scopeDecoder';
import { Strategy } from 'interfaces/model/strategy.interface';
import JWT from './jwt.strategy';

export default abstract class Strategies {
	private static readonly allowed: string[] = ['jwt'];
	private static readonly strategies: Record<string, Strategy> = {
		jwt: new JWT(),
	};

	static readonly isConfigured = (strategy: Strategy) => {
		return strategy?.config && ((NODE_ENV !== 'development' && this.allowed.includes(strategy.type)) || true);
	};

	static readonly getStrategies = (env: NodeJS.Process['env'], rootUrl: string) => {
		return Object.keys(this.strategies)
			.map((type) => {
				const strategy = this.strategies[type];
				const callbackURL = `${rootUrl}/${type}/callback`;
				strategy.config = strategy.getConfig(env, callbackURL);
				if (strategy?.config?.scope) {
					strategy.config.scope = scopeDecoder(strategy.config.scope);
				}
				strategy.type = type;
				return strategy;
			})
			.filter((strategy) => this.isConfigured(strategy));
	};
}
