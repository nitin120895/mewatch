import * as React from 'react';
import { isContinuousEntryTemplate } from 'shared/page/pageEntryTemplate';

export default class ListPage extends React.Component<PageProps, any> {
	render() {
		const { loading } = this.props;
		const entries = this.renderEntries(this.props);
		return <div className="list-pg">{!loading && entries}</div>;
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
}
