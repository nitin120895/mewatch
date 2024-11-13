import * as React from 'react';
import { Bem } from 'shared/util/styles';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './Checkbox.scss';

const bem = new Bem('checkbox');

interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
	labelComponent?: React.ReactElement<any>;
	displayState?: form.DisplayState;
	message?: React.ReactElement<any> | string;
	mePass?: boolean;
	round?: boolean;
}

const Checkbox: React.SFC<CheckboxProps> = (props: CheckboxProps) => {
	const { labelComponent, displayState, label, className, disabled, message, required, round, mePass, ...rest } = props;
	const error = displayState === 'error';
	const classModifiers = { error, disabled, required, round, 'me-pass': mePass };

	return (
		<label className={cx(bem.b(classModifiers), className)}>
			<span className={bem.e('tick-box-wrap')}>
				<input type="checkbox" {...rest} disabled={disabled} className={cx(bem.e('input'), 'sr-only')} />
				<span className={bem.e('box')} />
				<TickIcon className={bem.e('tick')} width={20} height={20} />
				{required && mePass && <span className={bem.e('required')}>*</span>}
			</span>
			<IntlFormatter className={bem.e('label')}>{labelComponent ? labelComponent : label}</IntlFormatter>

			{message && (
				<IntlFormatter elementType="p" className={bem.e('message')} aria-hidden={!!message}>
					{message}
				</IntlFormatter>
			)}
		</label>
	);
};

Checkbox.defaultProps = {
	displayState: 'default',
	round: false
};

export default Checkbox;
