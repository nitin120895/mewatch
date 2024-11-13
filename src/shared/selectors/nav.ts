import { memoize } from 'shared/util/performance';

/**
 * Returns an array of lists from within the navigation.
 */
export const getNavContentLists = memoize(
	(navigation: api.Navigation): api.ItemList[] => {
		const { account, header } = navigation;
		const entries = header ? header.slice() : [];
		if (account) entries.push(account);
		return entries.reduce((contents: api.ItemList[], { content }) => {
			if (content && content.list) contents.push(content.list);
			return contents;
		}, []);
	}
);
