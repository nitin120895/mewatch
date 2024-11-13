import * as React from 'react';
import Spinner from '../../component/Spinner';
import IntlFormatter from '../../component/IntlFormatter';
import { isHeroEntryTemplate, isContinuousEntryTemplate } from 'shared/page/pageEntryTemplate';
import * as cx from 'classnames';

export default class ListPage extends React.Component<PageProps, any> {
	render() {
		const { title, loading } = this.props;
		const entries = this.renderEntries(this.props);
		const empty = isPageEmpty(loading, entries);
		return (
			<div className="list-pg">
				{loading && this.renderLoading()}
				{!loading && entries}
				{empty && this.renderEmpty(title, entries.length)}
			</div>
		);
	}

	private renderEntries({ entries, renderEntry, list }: PageProps) {
		let firstContinuousEntry = true;
		return (entries || []).map((entry, index) => {
			let queryParamsEnabled;
			if (firstContinuousEntry && isContinuousEntryTemplate(entry.template)) {
				queryParamsEnabled = true;
				firstContinuousEntry = false;
			}
			const entryProps = entry.type === 'ListDetailEntry' ? { list, queryParamsEnabled } : undefined;
			return renderEntry(entry, index, entryProps);
		});
	}

	private renderLoading() {
		return (
			<div className="page-entry">
				<Spinner className="page-spinner vp-center" delayVisibility={true} />
			</div>
		);
	}

	private renderEmpty(title: string, numEntries: number) {
		const classes = cx({ 'page-entry': numEntries === 0 }, 'page-entry--empty');
		return (
			<IntlFormatter elementType="div" className={classes} values={{ title }}>
				{`@{listPage_empty_msg|Sorry, {title} is unavailable}`}
			</IntlFormatter>
		);
	}
}

function isPageEmpty(loading: boolean, entries: any[]) {
	if (loading) return false;
	if (entries.length === 0) return true;
	if (entries.length === 1) {
		const props = entries[0].props;
		return isHeroEntryTemplate(props.template);
	}
	return false;
}
