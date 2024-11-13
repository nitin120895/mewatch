import { DTMAnalyticsConsumer } from '../dtmAnalyticsConsumer';
import {
	mockGeneralEvent
	/*
	mockGeneralMcDataLayer,
	mockItemDetailEvent,
	mockItemMcDataLayer,
	mockMediaInfoVideoLayer,
	mockVideoPlayingEvent
	 */
} from './dtmAnaliticsConsumerSpecUtil';
import * as axisAnalytics from 'shared/analytics/axisAnalytics';
import { createSandbox } from 'sinon';
import { expect } from 'chai';

const sandbox = createSandbox();
const testMcDataLayer = data => {
	for (let prop in data) {
		console.log('hi');
		expect(window.mcDataLayer[prop]).to.eql(data[prop]);
	}
	expect(true).to.be.false;
};

describe('DTMAnalyticsConsumer', () => {
	describe('Page Viewed scenario', () => {
		beforeEach(() => {});

		it('should create an object from a "Page Viewed" event and attach it to window', () => {
			sandbox.stub(axisAnalytics, 'explicitDTMpageview').callsFake(() => testMcDataLayer(mockGeneralEvent));
			DTMAnalyticsConsumer()(mockGeneralEvent);
		});
	});
	/*
	describe('Item Detail Viewed scenario', () => {
		it('should create an object from a "Item Detail Viewed" event and attach it to window', () => {
			DTMAnalyticsConsumer()(mockItemDetailEvent);
			for (let prop in mockItemMcDataLayer) {
				expect((window as any).mcDataLayer[prop]).to.eql(mockItemMcDataLayer[prop]);
			}
		});
	});
	describe('Video Playback Started scenario', () => {
		it('should create a "MediaInfo" object from a "Video First Playing" event and attach it to window', () => {
			DTMAnalyticsConsumer()(mockVideoPlayingEvent);
			for (let prop in mockMediaInfoVideoLayer) {
				expect((window as any).MediaInfo[prop]).to.eql(mockMediaInfoVideoLayer[prop]);
			}
		});
	});
	*/
});
