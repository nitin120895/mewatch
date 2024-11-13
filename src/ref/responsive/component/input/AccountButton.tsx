import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import Spinner from '../Spinner';
import CtaButton, { CtaButtonProps } from 'ref/responsive/component/CtaButton';
import { noop } from 'shared/util/function';
import { omit } from 'shared/util/objects';

import './AccountButton.scss';

interface AccountButtonProps extends CtaButtonProps {
	type?: 'button' | 'submit' | 'reset';
	loading?: boolean;
	spinnerLocation?: 'left' | 'right' | 'center';
}

const bem = new Bem('account-btn');

export default class AccountButton extends React.Component<AccountButtonProps, any> {
	static defaultProps = {
		onClick: noop,
		ordinal: 'primary',
		theme: 'light',
		loading: false,
		spinnerLocation: 'left'
	};

	private onClick = e => {
		// don't call the onclick if we're loading, this is to mimic a 'disabled' state
		if (!this.props.loading) {
			this.props.onClick(e);
		} else {
			// make sure we don't submit too
			e.preventDefault();
		}
	};

	render() {
		const { children, className, spinnerLocation, ...ctaProps } = this.props;
		const rest = omit(ctaProps, 'loading');

		return (
			<CtaButton
				{...rest}
				onClick={this.onClick}
				className={cx(
					bem.b(`${ctaProps.ordinal}-${ctaProps.theme}`, ctaProps.ordinal, {
						large: ctaProps.large
					}),
					className
				)}
			>
				{spinnerLocation === 'left' && this.renderSpinner()}
				{spinnerLocation === 'center' && this.renderSpinner()}
				<span className={cx(bem.e('content'), 'truncate')}>{children}</span>
				{spinnerLocation === 'right' && this.renderSpinner()}
			</CtaButton>
		);
	}

	renderSpinner() {
		const { loading, spinnerLocation, small } = this.props;
		return (
			<div className={bem.e('spinner-container', { visible: loading, small })}>
				<Spinner className={bem.e('spinner', spinnerLocation, { small, visible: loading })} />
			</div>
		);
	}
}
