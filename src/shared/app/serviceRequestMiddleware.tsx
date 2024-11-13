import { CHUNK_LOADING } from '../app/appWorkflow';

let lastRequest = '';
const timeout = 30 * 1000;
let time = 0;
let checkTimeInterver;

export type EventHandler = {
	id: string;
	handler: (e: any) => void;
};

export enum requestEvent {
	timeout
}

let events = {} as any;

export const addEventHandler = (event: requestEvent, handler: (e: any) => void, id: string) => {
	if (!events[event]) {
		events[event] = [
			{
				id: id,
				handler: handler
			}
		];
	} else {
		if (events[event].find(e => e.id === id)) {
			// error.
		} else {
			events[event].push({
				id: id,
				handler: handler
			});
		}
	}
};

export const removeEventHandler = (event: requestEvent, id: string) => {
	if (events[event]) {
		events[event].splice(events[event].findIndex(p => p.id === id));
	}
};

export const raiseEvent = (event: requestEvent, e: any = undefined) => {
	if (events[event]) {
		for (let i = 0; i < events[event].length; i++) {
			events[event][i].handler(e);
		}
	}
};

const startTimer = () => {
	time = 0;

	if (!checkTimeInterver) {
		checkTimeInterver = setInterval(() => {
			time += 500;

			if (time > timeout) {
				stopTimer();
				raiseEvent(requestEvent.timeout);
			}
		}, 500);
	}
};

const stopTimer = () => {
	clearInterval(checkTimeInterver);
	checkTimeInterver = 0;
};

const serviceRequestMiddleware = () => next => action => {
	if (_TV_) {
		if (action.type === CHUNK_LOADING) {
			if (action.payload) {
				startTimer();
			} else {
				stopTimer();
			}
		}

		if (action.type.endsWith('_START')) {
			lastRequest = action.type.replace('_START', '');
			startTimer();
		} else if (lastRequest && action.type === lastRequest) {
			stopTimer();
		}
	}

	return next(action);
};

export default serviceRequestMiddleware;
