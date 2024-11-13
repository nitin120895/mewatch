/**
 * This file (and any companion styling) should NOT be included within production builds!
 *
 * To achieve this we need to conditionally reference it based on environment variables. e.g.
 *
 * ```
 * // ES6 Modules don't allow conditional imports so we use CommonJS require instead.
 * const ListLoadingLogger = _QA_ ? require('./ListLoadingLogger').default : undefined;
 * ```
 *
 * ```
 * render() {
 * 	return {ListLoadingLogger ? <ListLoadingLogger loadingLists={} entryProps={} /> : undefined};
 * }
 * ```
 */

import * as React from 'react';

interface ListLoadingLoggerProps {
	loadingLists?: object;
	entryProps: PageEntryListProps;
}

export default function ListLoadingLogger({ loadingLists, entryProps }: ListLoadingLoggerProps) {
	/**
	 * In production builds our default CSP security would block this inline styling. Since this
	 * component isn't intended for production builds (we whitelist inline styles for qa) we
	 * can safely get away with it. We certainly wouldn't want to add styles for this component
	 * inside `shared-components.scss` since that would unnecessarily include them within prod CSS!
	 */
	if (!entryProps.list) return false;

	let styles = {
		position: 'absolute' as React.CSSWideKeyword,
		padding: 5,
		right: 10,
		zIndex: 999,
		backgroundColor: 'grey',
		opacity: 0.7
	};
	let status = undefined;

	if (loadingLists[entryProps.list.key]) {
		status = 'loading...';
		styles.backgroundColor = 'red';
	} else if (entryProps.list.items.length) {
		status = 'loaded';
	} else {
		status = 'empty';
	}

	return (
		<section className="page-entry page-entry-list-loading-logger" style={styles}>
			List status: {status}
		</section>
	);
}
