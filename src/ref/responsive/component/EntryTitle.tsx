import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';

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
}

const bem = new Bem('entry-title');

/**
 * Page Entry Title
 *
 * Use this as the title within all of your page entry components to ensure consistency.
 */
export default class EntryTitle extends React.Component<EntryTitleProps, any> {
	render() {
		const { customFields } = this.props;

		let tagline: string;
		if (customFields) {
			tagline = customFields.customTagline;
		}

		if (tagline) return this.renderTitleAndTagline(tagline);
		return this.renderTitle();
	}

	private renderTitle() {
		const { title, loading, list, customFields, headingClassName, mainUrl } = this.props;
		if (!title) return false;

		let url = mainUrl || (list ? list.path : undefined);

		if (customFields) {
			url = customFields.moreLinkUrl || url;
		}

		const classes = cx(bem.b({ loading: loading && loading.length > 0 }), headingClassName);
		let label = title;
		if (_DEV_) {
			// Suffix the template name on the end to aid in debugging
			// if (this.props.template) label = `${title} - ${this.props.template}`;
		}

		if (url) {
			return (
				<h4 className={classes}>
					<Link to={url} className={bem.e('link')}>
						{label}
					</Link>
				</h4>
			);
		}
		return <h4 className={classes}>{label}</h4>;
	}

	private renderTitleAndTagline(tagline) {
		return (
			<div>
				{this.renderTitle()}
				<span className={cx(bem.e('tagline'), 'truncate')}>{tagline}</span>
			</div>
		);
	}
}
