import { SEARCH } from 'shared/service/action/content';
import { memoize } from 'shared/util/performance';

export const getErroredQueries = memoize((erroredActions: Action<any>[]) => {
	return erroredActions.reduce((erroredQueries: string[], action: Action<any>) => {
		if (action.type === SEARCH) {
			erroredQueries.push(action.meta.info.query);
		}
		return erroredQueries;
	}, []);
});
