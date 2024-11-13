import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { get } from 'shared/util/objects';

import './Xed6.scss';

const bem = new Bem('xed6');

export default class Xed6 extends React.Component<PageEntryListProps, any> {
	render() {
		const { template, className, customFields } = this.props;
		const classes = cx(template.toLowerCase(), className);
		const subTitle = get(customFields, 'subtitle');

		return (
			<div className={classes}>
				<EntryTitle headingClassName={bem.e('title')} {...this.props} />

				{subTitle && <div className={bem.e('sub-title')}>{subTitle}</div>}
			</div>
		);
	}
}
