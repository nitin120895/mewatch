import { Observable, OperatorFunction } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';
import { isObject, pick } from '../../util/objects';
import { ContextStream } from '../types/stream';
import {
	BasicContextProperty,
	EntryContextProperty,
	ItemContextProperty,
	StandardContextProperty
} from '../types/v3/context';
import {
	ContextProperties,
	EventWithContext,
	PartialEvent,
	PartialEventMapped
} from '../types/v3/event/analyticsEvent';
import { AnalyticsEventMap } from '../types/v3/event/analyticsEventMap';

export function toEvent<T extends keyof AnalyticsEventMap, S>(
	type: T,
	detailMapper: (streamData: S) => AnalyticsEventMap[T]['detail'] = s => undefined
): OperatorFunction<S, { streamData: S; event: PartialEventMapped<AnalyticsEventMap[T]> }> {
	return function toEventOperator(source$) {
		return source$.pipe(map(s => ({ streamData: s, event: { type, timestamp: Date.now(), detail: detailMapper(s) } })));
	};
}

function _withContexts<C extends ContextProperties>(contextsToPick: (keyof C)[]) {
	return function<E extends PartialEvent, S>(
		context$: Observable<ContextStream>,
		contextMapper: (streamData: S, ctx: ContextStream & BasicContextProperty) => C = (s, ctx): C => ctx as C
	): OperatorFunction<{ streamData: S; event: E }, EventWithContext<E, C>> {
		return source$ => {
			const getContextStream = (streamData, { type, timestamp, detail }) =>
				context$.pipe(
					map(context => pick(contextMapper(streamData, context), ...contextsToPick)),
					first(context => contextsToPick.every(contextName => isObject(context[contextName]))),
					map(context => ({ type, timestamp, detail, context }))
				);

			return source$.pipe(mergeMap(({ streamData, event }) => getContextStream(streamData, event)));
		};
	};
}

export const withBasicContext = _withContexts<BasicContextProperty>(['session', 'user']);
export const withContext = _withContexts<StandardContextProperty>(['session', 'user', 'page']);
export const withEntryContext = _withContexts<EntryContextProperty>(['session', 'user', 'page', 'entry']);
export const withItemContext = _withContexts<ItemContextProperty>([
	'session',
	'user',
	'page',
	'entry',
	'item',
	'listData'
]);
