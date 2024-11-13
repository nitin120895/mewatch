import * as sinon from 'sinon';
import { expect } from 'chai';
import * as content from 'shared/service/content';
import { getBatchNextSchedule } from 'toggle/responsive/util/schedule';
import { GetNextSchedulesOptions } from 'shared/service/content';

describe.only('schedule utils', () => {
	describe('getBatchNextSchedule', () => {
		let nextScheduleStub;
		beforeEach(() => {
			nextScheduleStub = sinon
				.stub(content, 'getNextSchedules')
				.callsFake((channels: string[], date: Date, hour: number, minute: number, options?: GetNextSchedulesOptions) =>
					Promise.resolve({
						data: channels.map(id => ({ channelId: id, date, hour, minute, options }))
					} as any)
				);
		});

		afterEach(() => {
			nextScheduleStub.restore();
		});

		it('should do a nextScheduleRequest with the correct parameters', done => {
			const channelId = 42;
			const date = new Date();
			const options = { limit: 10 };
			getBatchNextSchedule(channelId, date, options).then(res => {
				expect(res).to.deep.equal({
					channelId,
					date,
					hour: date.getUTCHours(),
					minute: date.getUTCMinutes(),
					options
				});

				expect(nextScheduleStub.callCount).to.equal(1);
				done();
			});
		});

		it('should request an channel only once', done => {
			const channelId = 42;
			const date = new Date();
			const options = { limit: 10 };
			Promise.all([
				getBatchNextSchedule(43, date, { limit: 5 }),
				getBatchNextSchedule(channelId, date, { limit: 5 }),
				getBatchNextSchedule(channelId, date, options)
			]).then(([resA, resB, resC]) => {
				// channel id 43
				expect(resA.channelId).to.not.equal(channelId);
				expect((resA as any).options.limit).to.equal(5);

				// channel id 42
				expect(resB).to.deep.equal(resC);
				expect(resB).to.deep.equal({
					channelId,
					date,
					hour: date.getUTCHours(),
					minute: date.getUTCMinutes(),
					options
				});

				expect(nextScheduleStub.callCount).to.equal(2);
				done();
			});
		});
	});
});
