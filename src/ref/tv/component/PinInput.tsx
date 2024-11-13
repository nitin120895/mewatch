import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from './IntlFormatter';
import KeysModel from 'shared/util/platforms/keysModel';
import deviceModel from 'shared/util/platforms/deviceModel';
import './PinInput.scss';

export const pinLength = 4;

interface PinInputProps extends React.HTMLProps<any> {
	mode: 'check_profile' | 'check_play' | 'create';
	pinMsg?: string;
	useOSK?: boolean;
	onCancel?: () => void;
	onDone: (pin: string) => void;
}

interface PinInputState {
	pin: number[];
	showOSK: boolean;
}

const bem = new Bem('pin-input');

export default class PinInput extends React.Component<PinInputProps, PinInputState> {
	private inputRef: HTMLInputElement;
	private curValue = '';

	constructor(props) {
		super(props);
		this.state = {
			pin: props.pin || [],
			showOSK: !!props.useOSK
		};
	}

	componentDidMount() {
		if (this.state.showOSK && this.inputRef) {
			this.showOSK();
			this.inputRef.value = '';
			this.moveCursorToEnd(this.inputRef);
		}
	}

	componentWillUnmount() {
		if (this.props.useOSK) this.hideOSK();
	}

	componentWillReceiveProps(nextPros: PinInputProps) {
		const { pinMsg, useOSK } = this.props;
		const { pinMsg: nextPinMsg, useOSK: nextUseOSK } = nextPros;

		if (nextPinMsg !== pinMsg) {
			this.setState({ pin: [] });
		}

		if (nextUseOSK !== useOSK) {
			this.setState({ showOSK: !!nextUseOSK });
		}
	}

	componentDidUpdate() {
		if (this.state.showOSK) {
			this.showOSK();
		} else {
			this.hideOSK();
		}
	}

	private renderText(className, stringId) {
		return (
			<IntlFormatter tagName="div" className={className}>
				{stringId}
			</IntlFormatter>
		);
	}

	private showOSK = () => {
		if (this.inputRef) this.inputRef.focus();
		deviceModel.showOSK();
	};

	private hideOSK = () => {
		if (this.inputRef) this.inputRef.blur();
		deviceModel.hideOSK();
	};

	private moveCursorToEnd(el) {
		if (typeof el.selectionStart === 'number') {
			el.selectionStart = el.selectionEnd = el.value.length;
		} else if (typeof el.createTextRange !== 'undefined') {
			el.focus();
			let range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	}

	private onKeydown = e => {
		if (!this.props.useOSK) return;

		const keyCode = KeysModel.mapKeys(e.keyCode);

		if (KeysModel.imeKeys) {
			if (keyCode === KeysModel.imeKeys.DONE || keyCode === KeysModel.imeKeys.CANCEL || keyCode === KeysModel.Back) {
				this.setState({ showOSK: false });
				return;
			} else if (keyCode === KeysModel.imeKeys.OTHER_KEYS) {
				return;
			}
		}

		if (keyCode === KeysModel.Enter) {
			this.setState({ showOSK: true });
		} else if (keyCode === KeysModel.Back) {
			this.props.onCancel && this.props.onCancel();
		}
	};

	private onInput = e => {
		if (!this.state.showOSK) return;

		const newValue = this.inputRef.value;

		if (this.curValue === newValue) return;

		// clear all by user
		if (newValue.length === 0) {
			this.curValue = '';
			this.setState({ pin: [] });
			return;
		}

		// delete by user
		if (newValue.length < this.curValue.length) {
			this.removePin();
			this.curValue = newValue;
			return;
		}

		const newlyInputChar = newValue.charAt(newValue.length - 1);

		if (newlyInputChar >= '0' && newlyInputChar <= '9') {
			this.inputPin(Number.parseInt(newlyInputChar));
		}

		this.curValue = this.inputRef.value;
	};

	render(): any {
		const { mode, pinMsg, useOSK } = this.props;
		const { pin } = this.state;

		let pins = [];
		for (let i = 0; i < pinLength; i++) {
			if (i < pin.length) {
				pins.push(pin[i]);
			} else {
				pins.push(-1);
			}
		}

		return (
			<div className={bem.b()}>
				<div className={bem.e('content', { useOSK })}>
					{(mode === 'check_profile' || mode === 'check_play') &&
						this.renderText(bem.e('title'), '@{enter_pin|ENTER PIN}')}
					{mode === 'create' && this.renderText(bem.e('title'), '@{create_pin|Create Pin}')}

					{mode === 'create' &&
						this.renderText(bem.e('prompt'), '@{create_pin_msg|A restricted profile requires a Pin.}')}
					{mode === 'check_play' &&
						this.renderText(bem.e('prompt'), '@{check_pin_play|Using your remote, enter your 4-digit PIN to play}')}
					{mode === 'check_profile' &&
						this.renderText(bem.e('prompt'), '@{check_pin_switch_profile|A restricted profile requires a PIN.}')}

					<div className={bem.e('pin')}>
						{pins.map((char, index) => (
							<div
								key={`pin-char-${index}`}
								className={bem.e('char', {
									focused: index === pin.length || (index === pinLength - 1 && pin.length === pinLength)
								})}
							>
								<span className={bem.e('star', { show: char !== -1 })}>*</span>
							</div>
						))}
					</div>

					<IntlFormatter tagName="div" className={bem.e('msg', { show: !!pinMsg })}>
						{'@{account_pin_error|Incorrect, please try again}'}
					</IntlFormatter>
				</div>
				{useOSK && (
					<input
						className={bem.e('input')}
						ref={ref => (this.inputRef = ref)}
						onKeyDown={this.onKeydown}
						onInput={this.onInput}
					/>
				)}
			</div>
		);
	}

	public handleInput = (key: string): void => {
		switch (key) {
			case 'del':
				this.removePin();
				break;

			default:
				if (this.props.useOSK) {
					this.setState({ showOSK: true });
				} else {
					const codeValue = Number.parseInt(key);
					if (codeValue >= 0 && codeValue <= 9) {
						this.inputPin(codeValue);
					}
				}
		}
	};

	private inputPin(num: number) {
		let pin = this.state.pin;

		if (pin.length < pinLength) {
			pin.push(num);
			this.setState({ pin });
		}

		if (pin.length === pinLength) {
			const pin = this.state.pin;
			let pinCode = '';

			for (let i = 0; i < pin.length; i++) {
				pinCode += pin[i];
			}

			if (this.props.useOSK) {
				this.inputRef.value = '';
			}

			this.props.onDone(pinCode);
		}
	}

	private removePin() {
		let pin = this.state.pin;
		if (pin.length > 0) {
			pin = pin.slice(0, pin.length - 1);
			this.setState({ pin });
		}
	}
}
