import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { isObject } from 'shared/util/objects';
import { EventConsumer } from '../types/types';

const NULL = 'foo'.match('bar');

function sanitizeForIE<O>(o: O): O {
	const cleanObj = Object.create(NULL);
	for (let prop in o) {
		if (isObject(o[prop])) {
			cleanObj[prop] = sanitizeForIE(o[prop]);
		} else if (o.hasOwnProperty(prop)) {
			cleanObj[prop] = o[prop];
		}
	}
	return cleanObj;
}

export const debugLog: EventConsumer = function debugLog() {
	return (eventRaw: TrackingEvent): void => {
		// Strip out undefined
		const event = JSON.parse(JSON.stringify(eventRaw));

		if (typeof window['console']['table'] === 'function') {
			window['console']['log'](
				'[Event] :: %c%s%c :: %o',
				'color: red',
				event.type,
				'color: initial',
				event.context,
				event.detail || ''
			);
			// Support Evil IE11 which doesn't support colour - but and won't group properly without dir....?
		} else if (typeof window['console']['group'] === 'function') {
			const _console = window['console'] as any;
			const detail = sanitizeForIE(event.detail || {});
			const context = sanitizeForIE(event.context);

			_console['groupCollapsed'](event.type);
			_console['group']('context');
			_console['dir'](context);
			_console['groupEnd']('context');
			if (event.detail) {
				_console['group']('detail');
				_console['dir'](detail);
				_console['groupEnd']('detail');
			}
			_console['groupEnd'](event.type);
		}
	};
};
