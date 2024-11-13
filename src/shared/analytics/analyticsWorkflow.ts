import { Dispatch } from 'redux';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

export const ANALYTICS_EVENT = 'analytics/ANALYTICS_EVENT';

const initialState: state.Analytics = {
	events: []
};

export default function reducer(
	state: state.Analytics = initialState,
	action: Action<state.AnalyticsEvent>
): state.Analytics {
	if (action.error) {
		return state;
	}

	switch (action.type) {
		case ANALYTICS_EVENT:
			return reduceAnalyticsEvent(state, action);
		default:
			return state;
	}
}

function reduceAnalyticsEvent(state: state.Analytics, action: Action<state.AnalyticsEvent>) {
	const events = [...state.events];

	events.push(action.payload);

	return {
		...state,
		events
	};
}

export function analyticsEvent(
	analyticsEventType: AnalyticsEventType,
	data?: any
): (dispatch: Dispatch<state.Analytics>) => void {
	return (dispatch: Dispatch<state.Analytics>) => {
		dispatch({
			type: ANALYTICS_EVENT,
			payload: {
				event: analyticsEventType,
				data
			}
		});
	};
}

export function pageAnalyticsEvent(path: string, originator?: any): (dispatch: Dispatch<state.Analytics>) => void {
	return (dispatch: Dispatch<state.Analytics>) => {
		if (!path) return;

		dispatch({
			type: ANALYTICS_EVENT,
			payload: {
				event: AnalyticsEventType.GENERIC_ANALYTICS_EVENT,
				data: {
					type: 'Page',
					path,
					originator
				}
			}
		});
	};
}
