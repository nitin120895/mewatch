import * as React from 'react';
import * as cx from 'classnames';
import { getAccount } from 'shared/account/accountUtil';
import { DomTriggerPoints } from 'shared/analytics/types/types';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { wrapRailHeader } from 'shared/analytics/components/RailHeaderWrapper';
import Link from 'shared/component/Link';
import { isBoostRecommendationList } from 'shared/list/listUtil';
import { getPathname } from 'shared/page/pagePersistence';
import { isListEntry, isItemEntry, isTitleClickable } from 'shared/util/itemUtils';

import './EntryTitle.scss';

interface EntryTitleProps extends PageEntryPropsBase {
	list?: api.ItemList;
	item?: api.ItemSummary;
	loading?: number[];

	// For convenience EntryTitle instances usually object spread their parent's props (PageEntryPropsBase).
	// e.g. `<EntryTitle {...props} />`.
	// In this situation the regular `className` value is intended for the parent component so we ignore it
	// completely and instead expose this `headingClassName` prop for when you need to apply custom styling.
	// e.g. `<EntryTitle {...props} headingClassName="custom-heading" />`.
	headingClassName?: string;
	// some row types have special navigation conditions for entry title,
	// for CH2, CHD2, EPG3 will navigate to channel detail page, when not overriden on PM
	mainUrl?: string;
	disableLink?: boolean;
}

const bem = new Bem('entry-title');
const DEFAULT_NAME = 'you';
const TYPE_KEYWORD = '[x]';
const NAME_KEYWORD = '[name]';

/**
 * Page Entry Title
 *
 * Use this as the title within all of your page entry components to ensure consistency.
 */
class EntryTitle extends React.Component<EntryTitleProps, any> {
	render() {
		const { title, loading, list, customFields, headingClassName, disableLink, item, type } = this.props;
		const isEmptyListEntry = isListEntry(type) && list.size <= 0 && !list.items.length;
		const isEmptyItemEntry = isItemEntry(type) && !item;

		if (!title || isEmptyListEntry || isEmptyItemEntry) {
			return false;
		}

		let tagline;
		let url = isTitleClickable(list, getPathname()) ? list.path : undefined;

		if (customFields) {
			url = disableLink ? undefined : customFields.moreLinkUrl || url;
			tagline = customFields.customTagline;
		}

		const classes = cx(bem.b({ loading: loading && loading.length > 0 }), headingClassName);

		if (_DEV_) {
			// Suffix the template name on the end to aid in debugging
			// if (this.props.template) label = `${title} - ${this.props.template}`;
		}

		if (tagline) return this.renderTitleAndTagline(title, tagline, url, classes);

		return this.renderTitle(title, url, classes);
	}

	private renderTitle(title, url, classes) {
		const { list, activeProfile, customFields } = this.props;
		const isTitleClickable = (url && url.toLowerCase() !== 'none' && customFields.clickableTitle === 'true') || false;

		let entryTitle = title;
		if (isBoostRecommendationList(this.props)) {
			const firstName = get(getAccount(), 'firstName') || DEFAULT_NAME;
			const name = activeProfile ? firstName : DEFAULT_NAME;

			const seriesTitle = get(list, 'seriesTitle');
			const genre = get(list, 'genre');
			const updatedTitle = seriesTitle || genre || '';

			entryTitle = entryTitle.replace(TYPE_KEYWORD, updatedTitle).replace(NAME_KEYWORD, name);
		}

		if (isTitleClickable) {
			return (
				<TriggerProvider trigger={DomTriggerPoints.RailTitle}>
					<h4 className={classes}>
						<Link to={url} className={bem.e('link')}>
							{entryTitle}
							<span className={bem.e('icon')}>&#187;</span>
						</Link>
					</h4>
				</TriggerProvider>
			);
		}
		return <h4 className={classes}>{entryTitle}</h4>;
	}

	private renderTitleAndTagline(title, tagline, url, classes) {
		return (
			<div>
				{this.renderTitle(title, url, classes)}
				<span className={cx(bem.e('tagline'), 'truncate')}>{tagline}</span>
			</div>
		);
	}
}

export default wrapRailHeader(EntryTitle);
