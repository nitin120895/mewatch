import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './RadioButtonComponent.scss';

const bemRadioBtn = new Bem('radio-button');

export default function RadioButtonComponent({
	label,
	name,
	checked,
	value,
	onChange,
	disabled,
	className,
	children
}: React.HTMLProps<HTMLInputElement>) {
	const content = children ? children : label;
	return (
		<label className={cx(bemRadioBtn.b(), className)}>
			<input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
			{typeof content === 'string' && content.startsWith('@') ? (
				<IntlFormatter className={bemRadioBtn.e('label')}>{label}</IntlFormatter>
			) : (
				<span className={bemRadioBtn.e('label')}> {content} </span>
			)}
		</label>
	);
}
