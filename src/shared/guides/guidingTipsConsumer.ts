import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from '../analytics/types/types';
import { findPageSummary } from 'shared/page/sitemapLookup';
import { showGuidingTipAction } from 'shared/uiLayer/uiLayerWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';
import { GuidesManager } from './guidesManager';

let store: Redux.Store<state.Root>;
let guidesManager: GuidesManager;

export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
	guidesManager = GuidesManager.getInstance();
}

export const guidingTipsConsumer: EventConsumer = function httpEndpoint() {
	return (event: TrackingEvent): void => {
		switch (event.type) {
			case AnalyticsEventType.PAGE_VIEWED:
				showGuidingTip(event.type as AnalyticsEventType);
		}
	};
};

function showGuidingTip(action: AnalyticsEventType) {
	const state: state.Root = store.getState();
	const { key } = findPageSummary(location.pathname, state);

	const guidingTipForPage = guidesManager.getGuidingTip(key, action);

	if (guidingTipForPage) {
		store.dispatch(showGuidingTipAction(guidingTipForPage, key, action));
	}
}
