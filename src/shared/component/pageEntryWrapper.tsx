import * as React from 'react';
import * as cx from 'classnames';
import { isHeroEntryTemplate } from '../page/pageEntryTemplate';
import { hasEntryEmptyList } from '../list/listUtil';

const wrapEntryExtra = _TV_ ? view => view : require('../analytics/components/EntryWrapper').wrapAnalyticsEntry;

export default function wrapPageEntries(views) {
	return (views || []).map(view => {
		if (view.wrapped) return view;
		const wrapped = wrapPageEntry(wrapEntryExtra(view));
		wrapped.template = view.template || view.name;
		return wrapped;
	});
}

function wrapPageEntry(PageEntryBody) {
	const PageEntryContainer: any = class PageEntry extends React.PureComponent<any, any> {
		render() {
			const { template, index, list } = this.props;
			const isHero = isHeroEntryTemplate(template);
			let classes = cx(`page-entry${isHero ? ' page-entry--hero' : ''}`, template);

			// if row entry has empty but required list, do not show it
			if (hasEntryEmptyList(template, list)) {
				classes = cx(classes, 'page-entry--empty');
			}

			return (
				<section id={`row${index || 0}`} className={classes}>
					<PageEntryBody {...this.props} />
				</section>
			);
		}
	};
	PageEntryContainer.wrapped = true;
	return PageEntryContainer;
}
