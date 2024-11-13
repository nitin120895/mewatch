import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './CtaButton.scss';

export type CtaButtonOrdinal = 'primary' | 'secondary' | 'naked' | 'custom';

export interface CtaButtonProps extends React.HTMLProps<any> {
	ordinal?: CtaButtonOrdinal;
	focusable?: boolean;
	small?: boolean;
	large?: boolean;
	// theme denotes the background the button will be on
	// The button will then colour itself appropriate
	theme?: 'light' | 'dark' | 'blue';
	disabled?: boolean;
	mePass?: boolean;
}

/**
 * Call to Action Button.
 */
export default class CtaButton extends React.Component<CtaButtonProps, any> {
	static defaultProps = {
		focusable: true,
		ordinal: 'secondary',
		theme: 'dark'
	};

	private bem: Bem = new Bem('cta-btn');

	render() {
		const {
			className,
			children,
			ordinal,
			focusable,
			small,
			theme,
			large,
			disabled,
			mePass,
			...otherProps
		} = this.props;

		const classes = cx(
			this.bem.b(theme, ordinal, [`${ordinal}-${theme}`], {
				large,
				small,
				'me-pass': mePass
			}),
			className,
			'truncate'
		);

		return (
			<button type="button" {...otherProps} className={classes} tabIndex={focusable ? 0 : -1} disabled={disabled}>
				{children}
			</button>
		);
	}
}
