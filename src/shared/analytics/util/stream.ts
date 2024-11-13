import { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import {
	CTATypes,
	DomEventCta,
	DomEventCWPageRemoveSelectedCta,
	DomEventEntry,
	DomEventItem,
	DomEventIDPLinkCta,
	DomEventInfoLinkCta,
	DomEventInfoIconCta,
	DomEventItemCta,
	DomEventMenu,
	DomEventOfferCta,
	DomEventProductCta,
	DomEventProgramTagCta,
	DomEventRailHeader,
	DomEvents,
	DomEventSynopsisCta,
	DomEventPreferencesCta,
	DomEventSourceType,
	DomEventTrigger,
	DomEventVideoItem,
	EventName
} from '../types/types';
import { InputAction } from '../types/v3/action';
import { EntryContext, EntryContextTypes } from '../types/v3/context/entry';

export function logStream<T>(message = 'debugStream: '): MonoTypeOperatorFunction<T> {
	return source$ =>
		source$.pipe(
			tap((...args: any[]) => {
				console.log('>> ' + message, ...args);
			})
		);
}

export function isActionOfType<A extends InputAction<T>, T extends InputAction['type'] = A['type']>(...types: T[]) {
	return filter((action: A): action is A & { type: T } => types.some(type => type === action.type));
}

type DomEventMap = {
	item: DomEventItem;
	entry: DomEventEntry;
	menu: DomEventMenu;
	trigger: DomEventTrigger;
	CTA:
		| DomEventCta
		| DomEventIDPLinkCta
		| DomEventInfoLinkCta
		| DomEventInfoIconCta
		| DomEventItemCta
		| DomEventOfferCta
		| DomEventProductCta
		| DomEventProgramTagCta
		| DomEventPreferencesCta
		| DomEventSynopsisCta;
	railHeader: DomEventRailHeader;
	videoItem: DomEventVideoItem;
};

export function isEventOfSource<N extends DomEventSourceType, S extends DomEventMap[N]>(
	sourceType: N
): OperatorFunction<S, DomEventMap[N]> {
	return (source$: Observable<S>) => {
		return source$.pipe(filter((event: S): event is S => sourceType === event.sourceType));
	};
}

export function isEventOfType<T extends DomEvents>(...eventNames: Array<EventName>): MonoTypeOperatorFunction<T> {
	return (source$: Observable<T>) => {
		return source$.pipe(filter(({ eventName }: T) => eventNames.includes(eventName)));
	};
}

export function isEntryOfType<C extends EntryContext, T extends EntryContextTypes>(
	type: T
): MonoTypeOperatorFunction<C> {
	return (source$: Observable<C>) => {
		return source$.pipe(filter((entry: C): entry is C => entry && entry.type === type));
	};
}

type CTAEvents =
	| DomEventCta
	| DomEventCWPageRemoveSelectedCta
	| DomEventIDPLinkCta
	| DomEventInfoLinkCta
	| DomEventInfoIconCta
	| DomEventItemCta
	| DomEventOfferCta
	| DomEventPreferencesCta
	| DomEventProductCta
	| DomEventProgramTagCta
	| DomEventSynopsisCta;

type CTAEventsMap = {
	bag: DomEventCta;
	comment: DomEventCta;
	copyCode: DomEventCta;
	copyLink: DomEventCta;
	cwMenu: DomEventItemCta;
	cwMenuRemoveCW: DomEventItemCta;
	cwMenuViewInfo: DomEventItemCta;
	removeSelected: DomEventCWPageRemoveSelectedCta;
	idpLink: DomEventIDPLinkCta;
	like: DomEventCta;
	preferences: DomEventPreferencesCta;
	product: DomEventProductCta;
	programTag: DomEventProgramTagCta;
	infoLink: DomEventInfoLinkCta;
	infoIcon: DomEventInfoIconCta;
	offer: DomEventOfferCta;
	setReminder: DomEventItemCta;
	synopsis: DomEventSynopsisCta;
	trailer: DomEventItemCta;
	watch: DomEventItemCta;
	default: never;
};

export function isCTAType<N extends CTATypes, S extends CTAEventsMap[N]>(
	...type: Array<N>
): OperatorFunction<S, CTAEventsMap[N]> {
	return (source$: Observable<CTAEvents>) =>
		source$.pipe(filter((event: S): event is S => type.includes(event.data.type)));
}
