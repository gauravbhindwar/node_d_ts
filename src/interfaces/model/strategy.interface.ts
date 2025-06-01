import passport from 'passport';

export abstract class Strategy {
	abstract readonly Ctor: {
		new (config: Record<string, any>, toUser: (...args: any[]) => any): passport.Strategy;
	};

	abstract readonly getConfig: (env: NodeJS.Process['env'], callbackURL: string) => Record<string, any> | undefined;
	abstract readonly toUser: (...args: any[]) => any;
	abstract type?: string;
	config: Record<string, any> | undefined = undefined;
	readonly getOptions: (state?: string, tokenData?: State) => Record<string, any> | undefined = () => undefined;
}

export interface StrategiesOptions {
	readonly strategies: Strategy[];
	readonly env: NodeJS.Process['env'];
}

export interface State {
	userId: number;
	successURL: string;
	failureURL: string;
	token_provider?: string;
}
