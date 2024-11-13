import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import sass from 'ref/tv/util/sass';
import { FormattedMessage } from 'react-intl';
import KeysModel from 'shared/util/platforms/keysModel';
import deviceModel from 'shared/util/platforms/deviceModel';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import './InputSingleLine.scss';

const id = 'input-single-line';
const bem = new Bem(id);

interface InputSingleLineProps extends React.HTMLProps<any> {
	focused: boolean;
	value: string;
	maxLength?: number;
	placeholder?: string;
	useOSK?: boolean;
	showOSK?: boolean;
	className?: string;
	error?: string;
	valueChanged?: (curValue: string) => void;
	onBack?: () => void;
	onDone?: (value?: string) => void;
	isPasswordMode?: boolean;
	clearError?: () => void;
	onMouseEnter?: () => void;
	onMouseClick?: () => void;
	autoGoback?: boolean;
}

interface InputSingleLineState {
	showOSK: boolean;
}

export default class InputSingleLine extends React.Component<InputSingleLineProps, InputSingleLineState> {
	private inputRef: HTMLInputElement;
	private displaySpanRef: HTMLSpanElement;

	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			showOSK: props.showOSK
		};
	}

	componentDidMount() {
		const { useOSK, autoGoback, onBack } = this.props;
		const { showOSK } = this.state;

		if (showOSK) {
			this.showOSK();
		}

		if (useOSK) {
			this.context.focusNav.addEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id, visible => {
				if (!visible && this.state.showOSK) {
					this.hideOSK();

					if (autoGoback !== false) {
						// We use !== false here to make sure to go back when it's undefined or null
						onBack && onBack();
					}
				}
			});
			deviceModel.hidingOSK(() => {
				this.state.showOSK && onBack && onBack();
			});
		}
	}

	componentWillUnmount() {
		this.hideOSK();
		this.context.focusNav.removeEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id);
	}

	componentWillReceiveProps(nextProps: InputSingleLineProps) {
		// for Tizen
		if (this.inputRef && this.props.showOSK !== nextProps.showOSK) {
			if (nextProps.showOSK) {
				this.showOSK();
			} else {
				this.hideOSK();
			}
		}

		if (nextProps.error && nextProps.error !== this.props.error) {
			if (this.inputRef) this.inputRef.value = '';
		}

		if (nextProps.value !== this.props.value && nextProps.value === '') {
			if (this.inputRef) this.inputRef.value = '';
		}
	}

	componentDidUpdate() {
		if (this.state.showOSK) {
			this.inputRef && this.inputRef.focus();
			this.inputRef && this.setInputCursorPos(this.inputRef.value.length);
			deviceModel.showOSK();
		} else {
			this.inputRef && this.inputRef.blur();
			deviceModel.hideOSK();
		}
	}

	private showOSK = () => {
		this.setState({ showOSK: true });
	};

	private hideOSK = () => {
		this.setState({ showOSK: false });
	};

	private checkValue = () => {
		if (this.displaySpanRef.offsetWidth > sass.inputMaxWidth) {
			this.inputRef.value = this.inputRef.value.slice(0, -1);
		}
	};

	private onInput = e => {
		if (!this.props.useOSK) return;

		if (KeysModel.imeKeys && Object.keys(KeysModel.imeKeys).length !== 0) {
			// if no imeKeys, means there'll be no 'keydown' event when clicking on keyboard
			// so we should use 'input' event instead
			return;
		}

		const { valueChanged, clearError } = this.props;
		clearError && clearError();
		this.displaySpanRef && this.checkValue();
		valueChanged && valueChanged(this.inputRef.value);
	};

	private onKeyup = e => {
		if (!this.props.useOSK) return;

		const { valueChanged, onBack, onDone, clearError } = this.props;

		clearError && clearError();

		const keyCode = KeysModel.mapKeys(e.keyCode);
		if (KeysModel.imeKeys) {
			// for tizen like platform which has ime keys
			switch (keyCode) {
				case KeysModel.imeKeys.DONE:
					this.checkValue();
					onDone && onDone(this.inputRef.value);
					this.hideOSK();

					return;

				case KeysModel.imeKeys.CANCEL:
					this.hideOSK();
					onBack && onBack();
					return;

				case KeysModel.imeKeys.LEFT:
					// disable move cursor by virtual keyboard
					this.setInputCursorPos(this.inputRef.value.length);
					return;

				case KeysModel.imeKeys.DELETE:
					if (this.props.value === this.inputRef.value) this.inputRef.value = this.inputRef.value.slice(0, -1);
					valueChanged && valueChanged(this.inputRef.value);
					return;

				case KeysModel.imeKeys.DELETE_ALL:
					this.inputRef.value = '';
					valueChanged && valueChanged('');
					return;
			}
		} else {
			// For webos like platform which has no ime keys
			if (keyCode === KeysModel.Enter) {
				this.checkValue();
				onDone && onDone(this.inputRef.value);
				this.hideOSK();
				return;
			} else if (keyCode === KeysModel.Back) {
				this.hideOSK();
				onBack && onBack();
				return;
			}
		}

		switch (keyCode) {
			case KeysModel.Left:
			case KeysModel.Right:
			case KeysModel.Up:
			case KeysModel.Down:
			case KeysModel.Back:
			case KeysModel.Menu:
				break;

			case KeysModel.Enter:
				if (!this.inputRef.value && this.props.value) {
					this.inputRef.value = this.props.value;
				} else {
					this.displaySpanRef && this.checkValue();
					valueChanged && valueChanged(this.inputRef.value);
				}
				break;

			default:
				this.displaySpanRef && this.checkValue();
				valueChanged && valueChanged(this.inputRef.value);
				break;
		}
	};

	private setInputCursorPos(pos) {
		if (this.inputRef && pos > 0) {
			if (this.inputRef.setSelectionRange) {
				this.inputRef.setSelectionRange(pos, pos);
			}
		}
	}

	private onMouseClick = () => {
		if (!this.state.showOSK) {
			this.showOSK();
		}
	};

	render() {
		const { focused, value, error, maxLength, useOSK, placeholder, className, isPasswordMode } = this.props;

		const renderContent = () => {
			if (error) return <div onMouseEnter={this.props.onMouseEnter} onClick={this.props.onClick} />;

			return (
				<FormattedMessage id={placeholder}>
					{placeholder => (
						<div
							className={cx(bem.b({ focused }), className)}
							onMouseEnter={this.props.onMouseEnter}
							onClick={this.onMouseClick}
						>
							{useOSK && (
								<input
									className={bem.e('text')}
									type={isPasswordMode ? 'password' : 'text'}
									placeholder={placeholder}
									max={maxLength}
									ref={ref => (this.inputRef = ref)}
									onKeyUp={this.onKeyup}
									onInput={this.onInput}
									defaultValue={value}
									onClick={this.showOSK}
								/>
							)}

							<div className={bem.e('curValue')}>
								<span className={bem.e('text')} ref={ref => (this.displaySpanRef = ref)}>
									{value}
								</span>
								{this.renderCursor(focused)}
							</div>

							<div className={bem.e('placeholder', { hide: !!focused || !!value })}>{placeholder}</div>
						</div>
					)}
				</FormattedMessage>
			);
		};

		return renderContent();
	}

	private renderCursor(focused) {
		return <div className={bem.e('cursor', focused ? 'focused' : '')} />;
	}
}
