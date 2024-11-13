import * as React from 'react';
import { Bem } from 'shared/util/styles';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';

import './Checkbox.scss';

const bem = new Bem('checkbox');

interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
	label: string;
}

export default function tickIcon({ label, className, disabled, ...rest }: CheckboxProps) {
	return (
		<label className={cx(bem.b({ disabled: disabled }), className)}>
			<span className={bem.e('tick-box-wrap')}>
				<input type="checkbox" {...rest} disabled={disabled} className={cx(bem.e('input'), 'sr-only')} />
				<TickIcon className={bem.e('tick')} width={20} height={20} />
				<span className={bem.e('box')} />
			</span>
			<IntlFormatter className={bem.e('label')}>{label}</IntlFormatter>
		</label>
	);
}
