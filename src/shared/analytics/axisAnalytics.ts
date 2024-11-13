import { Middleware, Store } from 'redux';
import { AxisAnalytics, DomEvents, EventConsumer, VideoEvent } from 'shared/analytics/types/types';
import { TrackingEvent } from 'shared/analytics/types/v3/event';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContextStream, Sinks, Sources } from './types/stream';
import { InputAction } from './types/v3/action';

type Dispatcher = <A extends InputAction>(action: A) => A;

// Webpack HMR support: event handlers can be live-reloaded
const reload$ = new Subject<undefined>();
if (_DEV_ && module.hot) module.hot.accept('./events', () => reload$.next());

export function axisAnalytics(...consumers: EventConsumer[]): AxisAnalytics {
	// Emitter / Source Proxies
	const ACTION = new Subject<InputAction>();
	const STATE = new BehaviorSubject<state.Root | undefined>(undefined);
	const DOM_EVENT = new Subject<DomEvents>();
	const CONTEXT = new BehaviorSubject<ContextStream>({ listData: {} } as ContextStream);
	const EVENT = new Subject<TrackingEvent>();
	const VIDEO = new Subject<VideoEvent>();

	const sources: Sources = { ACTION, STATE, DOM_EVENT, CONTEXT, VIDEO };

	const middleware: Middleware = () => {
		return (next): Dispatcher => action => {
			let result = next(action);
			ACTION.next(action);
			return result;
		};
	};

	const run = (store?: Store<state.Root | undefined>) => {
		store && store.subscribe(() => STATE.next(store.getState()));

		// HMR friendly requiring of handlers
		const emitters: Sinks = require('./events').mainHandler(sources);

		emitters.CONTEXT.pipe(takeUntil(reload$)).subscribe(value => CONTEXT.next(value));
		emitters.EVENT.pipe(takeUntil(reload$)).subscribe((value: any) => EVENT.next(value));
	};

	// HMR Reload
	reload$.subscribe(() => run());

	consumers.forEach(consumer => EVENT.subscribe(consumer()));

	return {
		middleware,
		run,
		emitDomEvent: (event: DomEvents) => DOM_EVENT.next(event),
		emitVideoEvent: (event: VideoEvent) => VIDEO.next(event)
	};
}

export function explicitDTMpageview(): void {
	// Explicitly tell DTM analytics event occurred outside of automated DTM tracking:
	// https://docs.adobe.com/content/help/en/dtm/using/resources/rules/t-rules-direct-conditions.html
	if (window._satellite) {
		window._satellite.track('pageview');
	}
}
