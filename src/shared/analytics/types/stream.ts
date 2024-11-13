import { Observable } from 'rxjs';
import { DomEvents, VideoEvent } from './types';
import { InputAction } from './v3/action';
import { ContextProperty } from './v3/context';
import { TrackingEvent } from './v3/event';

export type ContextStream = Pick<ContextProperty, 'session' | 'page' | 'user' | 'entry' | 'listData'>;

interface SourceTypes {
	ACTION: InputAction;
	STATE: state.Root | undefined;
	CONTEXT: ContextStream;
	DOM_EVENT: DomEvents;
	VIDEO: VideoEvent;
}

interface SinkTypes {
	EVENT: TrackingEvent;
	CONTEXT: ContextStream;
}

export type AsObservableMap<T> = { [_ in keyof T]: Observable<T[_]> };

export type Sources = AsObservableMap<SourceTypes>;
export type Sinks = AsObservableMap<SinkTypes>;

export type StreamHandler = (sources: Sources) => Partial<Sinks>;

export type SideEffectKeys = keyof (Sources & Sinks);

export interface SideEffect {
	<S extends keyof Sources, T extends keyof Sinks>(sink: Sinks[T], handlerName: SideEffectKeys):
		| Sources[S]
		| Observable<any>;
}
