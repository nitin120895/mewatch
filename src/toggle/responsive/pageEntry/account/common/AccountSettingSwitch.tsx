import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter, { IntlValue } from 'ref/responsive/component/IntlFormatter';
import { SwitchInput, SwitchInputProps } from 'ref/responsive/component/input/SwitchInput';
import { Bem } from 'shared/util/styles';

import 'ref/responsive/pageEntry/account/common/AccountSettingSwitch.scss';

interface AccountSettingSwitchProps extends SwitchInputProps {
	description?: IntlValue;
	showSwitch?: boolean;
}

const bem = new Bem('acct-setting-switch');

export default class AccountSettingSwitch extends React.Component<AccountSettingSwitchProps, any> {
	static defaultProps = {
		labelEnabled: '@{account_common_switch_enabled|Enabled}',
		labelDisabled: '@{account_common_switch_disabled|Disabled}'
	};

	render() {
		const {
			className,
			label,
			description,
			labelEnabled,
			labelDisabled,
			onChange,
			checked,
			disabled,
			showSwitch
		} = this.props;
		return (
			<div className={cx(bem.b(), className)}>
				<div>
					<IntlFormatter elementType="p" className={bem.e('label')}>
						{label}
					</IntlFormatter>
					{description && (
						<IntlFormatter elementType="p" className={bem.e('description')}>
							{description}
						</IntlFormatter>
					)}
				</div>
				{showSwitch && (
					<SwitchInput
						className={cx(bem.e('switch'), { disabled })}
						labelEnabled={labelEnabled}
						labelDisabled={labelDisabled}
						onChange={onChange}
						checked={checked}
						disabled={disabled}
					/>
				)}
			</div>
		);
	}
}
