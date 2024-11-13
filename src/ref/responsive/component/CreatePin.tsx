import * as React from 'react';
import PinInput from './input/PinInput';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';

import './CreatePin.scss';

const bem = new Bem('create-pin');

interface CreatePinProps {
	onChange: (pin: number[]) => void;
	disable: boolean;
	error: boolean;
	title: string;
	children: string;
	pin: number[];
}

export default function CreatePin({ onChange, title, children, pin, disable, error }: CreatePinProps) {
	return (
		<div className={bem.b()}>
			<IntlFormatter elementType={'h2'} className={bem.e('title')}>
				{title}
			</IntlFormatter>
			<IntlFormatter elementType={'p'} className={bem.e('content')}>
				{children}
			</IntlFormatter>
			<PinInput
				error={error ? '@{app_error_unknown|Oops something went wrong.}' : ''}
				onChange={onChange}
				digits={pin}
				required={true}
				disabled={disable}
			/>
		</div>
	);
}
