import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './DigitInput.scss';

interface OverrideEvents extends React.HTMLProps<HTMLInputElement> {
	onKeyDown: any;
	onInput: any;
	onFocus: any;
	onClick: any;
}

interface DigitInputProps extends OverrideEvents {
	onInputRef: (node: HTMLInputElement) => void;
	error: boolean;
	index: number;
	dark?: boolean;
	onKeyDown: (e: React.SyntheticEvent<any>, i: number) => void;
	onInput: (e: React.SyntheticEvent<any>, i: number) => void;
	onFocus: (e: React.SyntheticEvent<any>, i: number) => void;
	onClick: (e: React.SyntheticEvent<any>, i: number) => void;
}

const bem = new Bem('digit-input');

export default class DigitInput extends React.Component<DigitInputProps, any> {
	private eventHook(funcName) {
		return e => {
			const eventFunc = this.props[funcName];
			if (eventFunc) eventFunc(e, this.props.index);
		};
	}

	private onKeyDown = this.eventHook('onKeyDown');
	private onInput = this.eventHook('onInput');
	private onFocus = this.eventHook('onFocus');
	private onClick = this.eventHook('onClick');

	render() {
		const { onInputRef, error, index, dark, ...rest } = this.props;
		return (
			<label>
				<IntlFormatter aria-hidden={true} className={'sr-only'}>
					{`@{pinInput_digit_label|number}`} {index + 1}
				</IntlFormatter>
				<input
					{...rest}
					maxLength={1}
					autoComplete="off"
					type="tel"
					className={bem.b({ error, dark })}
					ref={onInputRef}
					onKeyDown={this.onKeyDown}
					onInput={this.onInput}
					onFocus={this.onFocus}
					onClick={this.onClick}
				/>
			</label>
		);
	}
}
