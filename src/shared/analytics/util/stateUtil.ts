import * as Redux from 'redux';

let store: Redux.Store<state.Root>;
export function init(appStore: Redux.Store<state.Root>) {
	store = appStore;
}

export const dispatchAction = (action: any) => store.dispatch(action);

export const getStoreState = () => store.getState();
