import { ITimer, timerFactory } from '../Timer';

jest.useFakeTimers();

describe('Timer', () => {
	const callback = jest.fn();
	const timeout = 1000;

	let currentTime: number;
	const getCurrentTime = () => currentTime;

	const FakeTimeTimer = timerFactory(getCurrentTime);
	const timer: ITimer = new FakeTimeTimer(callback, timeout);

	const travelTime = (time: number) => {
		currentTime += time;
		jest.runTimersToTime(time);
	};

	beforeEach(() => {
		currentTime = 0;
		timer.start();
	});

	afterEach(() => {
		callback.mockReset();
		timer.reset();
	});

	it('should call callback when timer is over', () => {
		travelTime(timeout);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	describe('when stopped', () => {
		beforeEach(() => {
			travelTime(timeout / 2);
			timer.stop();
		});

		it('should not call the callback', () => {
			travelTime(timeout / 2);
			expect(callback).not.toHaveBeenCalled();
		});

		it('should call callback if resumed for enough left time', () => {
			timer.start();
			travelTime(timeout / 2);

			expect(callback).toHaveBeenCalledTimes(1);
		});

		describe('and then stopped again', () => {
			beforeEach(() => {
				timer.start();

				travelTime(timeout / 4);
				timer.stop();
			});

			it('should call callback if resumed for enough left time ', () => {
				timer.start();
				travelTime(timeout / 4);

				expect(callback).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('when reset', () => {
		beforeEach(() => {
			travelTime(timeout / 2);
			timer.reset();
		});

		it('should not call the callback after resuming for less than full timeout', () => {
			timer.start();
			travelTime(timeout / 2);

			expect(callback).not.toHaveBeenCalled();
		});

		it('should call the callback after resuming for full timeout', () => {
			timer.start();
			travelTime(timeout);

			expect(callback).toHaveBeenCalledTimes(1);
		});
	});
});
