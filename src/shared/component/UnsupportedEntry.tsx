/**
 * This file (and any companion styling) should NOT be included within production builds!
 *
 * To achieve this we need to conditionally reference it based on environment variables. e.g.
 *
 * ```
 * // ES6 Modules don't allow conditional imports so we use CommonJS require instead.
 * const UnsupportedEntry = (_DEV_ || _QA_) ? require('./UnsupportedEntry').default : undefined;
 * ```
 *
 * ```
 * render() {
 * 	return {UnsupportedEntry ? <UnsupportedEntry {...entryProps} /> : undefined};
 * }
 * ```
 */

import * as React from 'react';

interface UnsupportedEntryProps extends PageEntryPropsBase {
	index: number;
}

export default function UnsupportedEntry({ index, title, template }: UnsupportedEntryProps) {
	/**
	 * In production builds our default CSP security would block this inline styling. Since this
	 * component isn't intended for production builds (we whitelist inline styles for dev/qa) we
	 * can safely get away with it. We certainly wouldn't want to add styles for this component
	 * inside `shared-components.scss` since that would unnecessarily include them within prod CSS!
	 */
	const styles = { backgroundColor: 'rgba(245,0,19,.15)' };
	return (
		<section id={`row${index}`} className="page-entry page-entry--unsupported" style={styles}>
			<h4 className="entry-title">{title || 'Titleless Row'}</h4>
			<em>{`This row uses the '${template}' page entry template which hasn't been mapped for this page template!`}</em>
		</section>
	);
}
