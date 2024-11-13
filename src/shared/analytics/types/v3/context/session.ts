export interface SessionContext {
	id: string;
	startTime: number;
	app: {
		name: string;
		version: string;
		build: string;
		env: string;
	};
	userAgent: string;
}
