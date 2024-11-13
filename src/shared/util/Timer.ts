/**
 * Timer class to create a simple timers with start/pause/resume functionality.
 *
 * @module Timer
 */

export interface ITimer {
	start: () => void;
	stop: () => void;
	reset: () => void;
}

export const timerFactory = (getCurrentTime: () => number) =>
	class Timer implements ITimer {
		private timerId;
		private leftTime = 0;
		private startTime = 0;

		/**
		 * Create a Timer instance.
		 * @constructor
		 * @param {Function} callback [callback function will be fired after timeout].
		 * @param {number} timeout [time to timeout].
		 */
		constructor(private readonly callback: Function, private readonly timeout: number) {}

		/**
		 * Start Timer or resume after stopping
		 */
		start() {
			if (this.timerId) {
				return;
			}

			this.startTime = getCurrentTime();
			this.leftTime = this.leftTime || this.timeout;

			this.timerId = setTimeout(() => {
				this.callback();
				this.clear();
			}, this.leftTime);
		}

		/**
		 * Stop/pause Timer and save left time
		 */
		stop() {
			if (!this.timerId) {
				return;
			}

			clearTimeout(this.timerId);
			this.timerId = undefined;

			this.leftTime -= getCurrentTime() - this.startTime;
		}

		/**
		 * Reset Timer and clear all timer
		 */
		reset() {
			this.stop();
			this.clear();
		}

		private clear() {
			this.leftTime = 0;
			this.timerId = undefined;
		}
	};

export const Timer = timerFactory(Date.now);
