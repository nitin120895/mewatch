/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaHtml5Time implements Conviva.TimeInterface {
	getEpochTimeMs(): number {
		return new Date().getTime();
	}

	release(): void {}
}
