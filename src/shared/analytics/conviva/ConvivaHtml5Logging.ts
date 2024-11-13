/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaHtml5Logging implements Conviva.LoggingInterface {
	private logger: any;

	constructor(logger: any) {
		this.logger = logger;
	}

	consoleLog(message: string, logLevel: Conviva.SystemSettings.LogLevel): void {
		if (typeof this.logger === 'undefined') return;

		if (
			(this.logger.log && logLevel === Conviva.SystemSettings.LogLevel.DEBUG) ||
			logLevel === Conviva.SystemSettings.LogLevel.INFO
		) {
			this.logger.log(message);
		} else if (this.logger.warn && logLevel === Conviva.SystemSettings.LogLevel.WARNING) {
			this.logger.warn(message);
		} else if (this.logger.error && logLevel === Conviva.SystemSettings.LogLevel.ERROR) {
			this.logger.error(message);
		}
	}

	release(): void {}
}
