/// <reference path="conviva-core-sdk.d.ts" />

export class ConvivaHtml5Timer implements Conviva.TimerInterface {
	createTimer(
		timerAction: Conviva.TimerAction,
		intervalMs: number,
		actionName?: string | null
	): Conviva.TimerCancelFunction {
		let timerId = window.setInterval(timerAction, intervalMs);
		const cancelTimerFunc = () => {
			if (timerId !== -1) {
				window.clearInterval(timerId);
				timerId = -1;
			}
		};
		return cancelTimerFunc;
	}

	release(): void {}
}
