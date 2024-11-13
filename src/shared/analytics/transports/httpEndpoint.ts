import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { EventConsumer } from '../types/types';

export const httpEndpoint: EventConsumer = function httpEndpoint() {
	return (event: TrackingEvent): void => {
		fetch(`https://massiveanalytics.azurewebsites.net/api/capture-request/${event.context.session.id}`, {
			mode: 'no-cors',
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				Accept: 'text/plain'
			},
			body: JSON.stringify(event)
		} as any).catch(() => {
			_DEV_ && console.error('Failed to send analytics network request');
		});
	};
};
