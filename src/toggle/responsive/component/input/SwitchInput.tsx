import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './SwitchInput.scss';

const bem = new Bem('switch-input');

export interface SwitchInputProps extends React.HTMLProps<HTMLInputElement> {
	labelEnabled?: string;
	labelDisabled?: string;
	labelPosition?: 'right' | 'left';
}

export class SwitchInput extends React.Component<SwitchInputProps, any> {
	static defaultProps = {
		labelEnabled: '@{switch_input_label_enabled|On}',
		labelDisabled: '@{switch_input_label_disabled|Off}',
		labelPosition: 'left'
	};

	render() {
		// tslint:disable:no-unused-variable
		const { className, labelPosition, labelEnabled, labelDisabled, disabled, checked, ...rest } = this.props;
		// tslint:enable
		const sliderClasses = cx(bem.e('slider', { checked, disabled }));

		return (
			<label className={cx(bem.b({ disabled }), className)}>
				{labelPosition === 'left' && this.renderLabel()}
				<input
					{...rest}
					type="checkbox"
					disabled={disabled}
					checked={checked}
					className={cx(bem.e('checkbox'), 'sr-only')}
				/>
				<span className={sliderClasses}>
					<span className={cx(bem.e('switch', { checked }))} />
				</span>
				{labelPosition === 'right' && this.renderLabel()}
			</label>
		);
	}

	renderLabel() {
		const { id, disabled, labelPosition, labelEnabled, labelDisabled, checked } = this.props;
		return (
			<span className={bem.e('label-wrapper', labelPosition)}>
				<IntlFormatter elementType="span" htmlFor={id} className={bem.e('label', { disabled }, labelPosition)}>
					{checked ? labelEnabled : labelDisabled}
				</IntlFormatter>
				{/* This markup is used to keep the distance from the left equal when toggling between states which
				will stop the jitter when changing states */}
				<span className={bem.e('label-padding')} aria-hidden="true">
					<IntlFormatter className={bem.e('label-padding-label')}>{labelEnabled}</IntlFormatter>
					<IntlFormatter className={bem.e('label-padding-label')}>{labelDisabled}</IntlFormatter>
				</span>
			</span>
		);
	}
}
