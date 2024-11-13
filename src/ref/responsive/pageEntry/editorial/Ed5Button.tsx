import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import Link from 'shared/component/Link';
import CustomColorsButton from 'ref/responsive/component/CustomColorsButton';

import './Ed5Button.scss';

interface CustomFields {
	title: string;
	moreLinkUrl: string;
	textColor?: customFields.Color;
	backgroundColor?: customFields.Color;
	textHorizontalAlignment?: position.AlignX;
}

interface Ed5ButtonProps extends TPageEntryPropsBase<CustomFields> {}

const bem = new Bem('ed5');

export default class Ed5Button extends React.Component<Ed5ButtonProps, any> {
	render() {
		const { moreLinkUrl, title, textColor, backgroundColor, textHorizontalAlignment } = this.props.customFields;
		return (
			<div className={cx(bem.b(), `txt-${textHorizontalAlignment || 'center'}`)}>
				<Link className={bem.e('link')} to={moreLinkUrl}>
					<CustomColorsButton
						className={bem.e('btn')}
						textColor={textColor}
						backgroundColor={backgroundColor}
						ordinal="primary"
					>
						{title}
					</CustomColorsButton>
				</Link>
			</div>
		);
	}
}
