import { appEventStreamHandler } from './app';
import { browseStreamHandler } from './browse';
import { contextStream } from './context';
import { ctaStreamHandler } from './cta';
import { errorStreamHandler } from './error';
import { itemStreamHandler } from './item';
import { menuStreamHandler } from './menu';
import { playbackStreamHandler } from './playback';
import { userProfileStreamHandler } from './user/profile';
import { userRegisterStreamHandler } from './user/register';
import { userActionStreamHandler } from './user/userAction';
import { genericStreamHandler } from './generic';
import { subscriptionStreamHandler } from './subscription';
import { Observable, merge } from 'rxjs';
import { share } from 'rxjs/operators';
import { Sources, Sinks } from 'shared/analytics/types/stream';

const combineHandlers = (sources: Sources, ...handlers): Sinks => {
	const map: { [_ in keyof Sinks]: Observable<any>[] } = {
		EVENT: [],
		CONTEXT: []
	};
	handlers.forEach(handler => {
		const handlerMap = handler(sources);
		Object.entries(handlerMap).forEach(([name, emitter]) => {
			map[name] = map[name].concat(emitter);
		});
	});
	return {
		EVENT: merge(...map.EVENT).pipe(share()),
		CONTEXT: merge(...map.CONTEXT).pipe(share())
	};
};

export const mainHandler = (sources: Sources) =>
	combineHandlers(
		sources,
		appEventStreamHandler,
		browseStreamHandler,
		errorStreamHandler,
		itemStreamHandler,
		userProfileStreamHandler,
		userRegisterStreamHandler,
		userActionStreamHandler,
		playbackStreamHandler,
		contextStream,
		genericStreamHandler,
		ctaStreamHandler,
		menuStreamHandler,
		subscriptionStreamHandler
	);
