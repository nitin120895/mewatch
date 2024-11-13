import * as React from 'react';
import { Bem } from 'shared/util/styles';
import './EntryTitle.scss';

interface EntryTitleProps extends PageEntryPropsBase {
	verticalMargin?: number;
}

const bem = new Bem('entry-title');

/**
 * Page Entry Title
 *
 * Use this as the title within all of your page entry components to ensure consistency.
 */
export default class EntryTitle extends React.Component<EntryTitleProps, any> {
	render(): any {
		const { title, customFields, template, verticalMargin } = this.props;
		const tagline = customFields && customFields.customTagline;
		const isBRow = verticalMargin > 0 ? 'brand-row' : '';
		let display = '';
		if (!title && !tagline) display = 'none';

		return (
			<div className={bem.b(template, isBRow, display)}>
				{title && <div className={bem.e('title')}>{title}</div>}
				{tagline && <div className={bem.e('tagline')}>{tagline}</div>}
			</div>
		);
	}
}
