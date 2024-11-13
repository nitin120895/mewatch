import * as React from 'react';
import * as cx from 'classnames';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import PinInput from 'ref/tv/component/PinInput';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { cancelPrompt } from 'shared/account/sessionWorkflow';
import { checkAccountPassword, CHECK_ACCOUNT_PW, createPin } from 'shared/account/accountWorkflow';
import { clearError } from 'shared/app/appWorkflow';
import { FormattedMessage } from 'react-intl';
import { KEY_CODE } from 'ref/tv/util/keycodes';
import DeviceModel from 'shared/util/platforms/deviceModel';
import InputSingleLine from 'ref/tv/component/InputSingleLine';
import './EnterPasswordModal.scss';

export type EnterPasswordMode = 'password' | 'pin';

const id = 'enter-password-modal';
const bem = new Bem(id);

const useOSK = DeviceModel.hasOSK();
const maxPasswordLength = 32;

type EnterPasswordModalProps = Partial<{
	cancel: () => void;
	checkAccountPassword: (pw: string) => void;
	createPin: (pin: string) => void;
	clearError: () => void;
	close: (isSuc: boolean) => void;
	hasPin: boolean; // If already has a pin, do not need to create one after checking password
	baseState: EnterPasswordMode;
	isEditingProfile: boolean; // If user enter from EditProfileModal
	focusable: boolean;
	onFocusableRowCreated: (row: Focusable) => void;
}>;

type EnterPasswordStateProps = {
	error: string[];
	accountSettingsToken: api.AccessToken;
	pinEnabled: boolean;
	websiteUrl: string;
};

interface EnterPasswordModalState {
	selectedIndex: number;
	curValue: string;
	errorMsg: string;
	curMode: EnterPasswordMode;
	pinMsg?: string;
	showOSK?: boolean;
}

class EnterPasswordModal extends React.Component<
	EnterPasswordModalProps & EnterPasswordStateProps,
	EnterPasswordModalState
> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;
	private pinInput: PinInput;

	constructor(props: EnterPasswordModalProps & EnterPasswordStateProps) {
		super(props);

		this.state = {
			selectedIndex: 0,
			curValue: '',
			errorMsg: '',
			curMode: props.baseState || 'password',
			pinMsg: '',
			showOSK: true
		};

		this.focusableRow = {
			focusable: props.focusable === false ? false : true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		if (this.props.focusable !== false) this.context.focusNav.setFocus(this.focusableRow);
		else this.props.onFocusableRowCreated && this.props.onFocusableRowCreated(this.focusableRow);

		this.context.focusNav.addEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id, v => {
			this.setState({ showOSK: !!v });
		});
	}

	componentWillUnmount() {
		if (this.props.focusable !== false) this.context.focusNav.resetFocus();

		this.context.focusNav.removeEventHandler(GlobalEvent.KEYBOARD_VISIBILITY_CHANGE, id);
	}

	componentWillReceiveProps(nextProps: EnterPasswordModalProps & EnterPasswordStateProps) {
		if (nextProps.error && nextProps.error.length > 0) {
			const error = nextProps.error[nextProps.error.length - 1] as any;
			let errorMsg = '';
			if (error) {
				if (error.payload) {
					errorMsg = error.payload.message;
				} else {
					errorMsg = error;
				}
			}

			this.setState({ errorMsg, selectedIndex: 0, curValue: '', showOSK: false });
		} else {
			if (this.state.errorMsg) {
				this.setState({ errorMsg: '' });
			}
		}

		if (nextProps.accountSettingsToken && nextProps.accountSettingsToken !== this.props.accountSettingsToken) {
			if (this.props.hasPin) {
				this.close(true);
			} else {
				this.setState({ curMode: 'pin' });
			}
		}

		if (this.props.pinEnabled !== nextProps.pinEnabled) {
			this.close(true);
		}
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveUp = (): boolean => {
		const { selectedIndex } = this.state;

		this.props.clearError();

		if (selectedIndex > 0) {
			this.setState({
				selectedIndex: 0,
				showOSK: useOSK
			});
		}
		return true;
	};

	private moveDown = (): boolean => {
		const { selectedIndex, curValue } = this.state;

		if (selectedIndex === 0) {
			if (curValue) {
				this.setState({
					selectedIndex: 1,
					showOSK: false
				});
			} else {
				this.setState({
					selectedIndex: 2,
					showOSK: false
				});
			}
		}
		return true;
	};

	private moveLeft = (): boolean => {
		const { selectedIndex, curValue } = this.state;

		if (selectedIndex === 2 && curValue) {
			this.setState({
				selectedIndex: 1
			});
		}
		return true;
	};

	private moveRight = (): boolean => {
		const { selectedIndex } = this.state;

		if (selectedIndex === 1) {
			this.setState({
				selectedIndex: 2
			});
		}

		return true;
	};

	private exec = (act?: string): boolean => {
		const { curValue, selectedIndex, curMode } = this.state;
		switch (act) {
			case 'click':
				if (curMode === 'password') {
					if (selectedIndex === 0) {
						if (useOSK) {
							this.setState({ showOSK: true });
						}
					} else {
						if (useOSK) {
							this.setState({ showOSK: false });
						}
					}

					if (selectedIndex === 1) {
						// 0: input, 1: Confirm button
						if (curValue) {
							// Confirm
							this.props.checkAccountPassword(curValue);
						}
					} else if (selectedIndex === 2) {
						// cancel
						this.close(false);
					}
				} else {
					// curMode === 'pin'
				}
				return true;

			case 'del':
				if (curMode === 'pin') {
					this.pinInput.handleInput('del');
				} else {
					if (selectedIndex === 0 && curValue.length > 0) {
						const curValue = this.state.curValue.substr(1);
						this.setState({
							curValue
						});
					}
				}

				break;

			case 'esc':
				this.setState({ showOSK: false });
				this.close(false);
				break;

			default:
				if (curMode === 'pin') {
					const codeValue = Number.parseInt(act);
					if (codeValue >= 0 && codeValue <= 9) {
						this.pinInput.handleInput(act);
					}

					if (useOSK) {
						this.pinInput.handleInput('A');
					}
				} else {
					if (curValue.length >= maxPasswordLength) return;

					const codeValue = act.charCodeAt(0);
					if (codeValue >= KEY_CODE.CHAR_START && codeValue <= KEY_CODE.CHAR_END) {
						this.setState({ curValue: this.state.curValue + act });
						this.props.clearError();
					}
				}

				break;
		}

		return true;
	};

	private close = isSuc => {
		if (!this.props.isEditingProfile) {
			this.context.focusNav.hideDialog();
		}

		this.props.close && this.props.close(isSuc);
	};

	private onPinInputDone = (pin: string) => {
		// create pin here
		this.props.createPin(pin);
	};

	private onPinInputCancel = () => {
		this.close(false);
	};

	private onPasswordInputCancel = () => {
		// move focus on Cancel button
		setImmediate(() => {
			this.setState({ selectedIndex: 2, showOSK: false });
		});
	};

	private onPasswordInputDone = (value?: string) => {
		// move focus to Done button, and check password
		setImmediate(() => {
			this.setState({ selectedIndex: 1, showOSK: false });
		});
		this.props.checkAccountPassword(value);
	};

	private onValueChanged = (value: string) => {
		const v = value.trim();

		if (v.length > maxPasswordLength) return;

		this.setState({ curValue: v });
		this.props.clearError();
	};

	private onMouseClick = () => {
		if (!this.state.showOSK) {
			this.setState({ showOSK: true, selectedIndex: 0 });
		}
	};

	private mouseEnterInput = () => {
		this.setState({ selectedIndex: 0 });
	};

	private mouseEnterConfirmBtn = () => {
		this.state.curValue && this.setState({ selectedIndex: 1 });
	};

	private mouseEnterCancelBtn = () => {
		this.setState({ selectedIndex: 2 });
	};

	private clickConfirmBtn = () => {
		if (this.state.curValue) {
			this.props.checkAccountPassword(this.state.curValue);
			this.setState({ selectedIndex: 1, showOSK: false });
		}
	};

	private clickCancelBtn = () => {
		this.close(false);
	};

	render() {
		const { selectedIndex, curValue, errorMsg, curMode, showOSK } = this.state;
		let curValueFake = '';
		let focused = false;

		for (let i = 0; i < curValue.length; i++) {
			curValueFake += '*';
		}

		if (curMode === 'password' && selectedIndex === 0) {
			focused = true;
		}

		return (
			<div className={bem.b()}>
				{curMode === 'password' && [
					this.renderPasswordMode(focused, curValueFake, selectedIndex, showOSK),
					this.renderErrorMessage(errorMsg)
				]}
				{curMode === 'pin' && !this.props.hasPin && this.renderPinMode()}
			</div>
		);
	}

	private renderPasswordMode(focused: boolean, curValueFake: string, selectedIndex: number, showOSK: boolean) {
		return (
			<div className={bem.e('content', { useOSK })} key={'modeContent'}>
				<FormattedMessage id="enter_password_title">
					{value => <div className={bem.e('title')}>{value}</div>}
				</FormattedMessage>
				<div className={bem.e('input')} onClick={this.onMouseClick}>
					<InputSingleLine
						focused={focused}
						value={curValueFake}
						useOSK={useOSK}
						showOSK={showOSK}
						placeholder={'enter_password_placeholder'}
						isPasswordMode={true}
						onBack={this.onPasswordInputCancel}
						onDone={this.onPasswordInputDone}
						clearError={this.props.clearError}
						valueChanged={this.onValueChanged}
						onMouseClick={this.onMouseClick}
						onMouseEnter={this.mouseEnterInput}
						autoGoback={false}
					/>
				</div>
				<div className={bem.e('controls')}>
					<FormattedMessage id="enter_password_confirm">
						{value => (
							<div
								className={cx(
									bem.e('confirm'),
									selectedIndex === 1 ? 'focused' : '',
									this.state.curValue ? '' : 'disable'
								)}
								onMouseEnter={this.mouseEnterConfirmBtn}
								onClick={this.clickConfirmBtn}
							>
								{value}
							</div>
						)}
					</FormattedMessage>
					<FormattedMessage id="cancel">
						{value => (
							<div
								className={cx(bem.e('cancel'), selectedIndex === 2 ? 'focused' : '')}
								onMouseEnter={this.mouseEnterCancelBtn}
								onClick={this.clickCancelBtn}
							>
								{value}
							</div>
						)}
					</FormattedMessage>
				</div>
			</div>
		);
	}

	private renderErrorMessage = (errorMsg: string) => {
		return (
			<div className={bem.e('message', { useOSK })} key={'errorMsg'}>
				{this.renderErrorMessageTips('enter_password_error_tips', !!errorMsg)}
				{this.renderErrorMessageTips('enter_password_error_reset', !!errorMsg, this.props.websiteUrl)}
			</div>
		);
	};

	private renderPinMode() {
		const { pinMsg } = this.state;

		return (
			<div className={bem.e('content')} onClick={this.onMouseClick}>
				<PinInput
					ref={ref => (this.pinInput = ref)}
					mode="create"
					className={bem.e('pin')}
					useOSK={useOSK}
					pinMsg={pinMsg}
					onDone={this.onPinInputDone}
					onCancel={this.onPinInputCancel}
				/>
			</div>
		);
	}

	private renderErrorMessageTips = (id: string, isShow: boolean, urlSign?: string) => {
		const urlSignin = urlSign ? urlSign + '/signin' : '';

		return (
			<FormattedMessage id={id} values={{ urlSignin }}>
				{value => <div className={bem.e('error', { show: isShow })}>{value}</div>}
			</FormattedMessage>
		);
	};
}

function getErroredQueries(erroredActions: Action<any>[]): string[] {
	return erroredActions.reduce((erroredQueries: string[], action: Action<any>) => {
		if (action.type === CHECK_ACCOUNT_PW) {
			erroredQueries.push(action as any);
		}
		return erroredQueries;
	}, []);
}

function mapStateToProps(state: state.Root): EnterPasswordStateProps {
	let accountSettingsToken;
	let token;

	if (state.session.tokens) {
		for (let i = 0; i < state.session.tokens.length; i++) {
			token = state.session.tokens[i];
			if (token.scope === 'Settings' && token.type === 'UserAccount') {
				accountSettingsToken = token;
			}
		}
	}

	return {
		error: getErroredQueries(state.app.erroredActions),
		accountSettingsToken,
		pinEnabled: state.account.info.pinEnabled,
		websiteUrl: state.app.config.general.websiteUrl
	};
}

function mapDispatchToProps(dispatch: any): EnterPasswordModalProps {
	return {
		cancel: () => dispatch(cancelPrompt()),
		checkAccountPassword: pw => dispatch(checkAccountPassword(pw)),
		createPin: pin => dispatch(createPin({ pin })),
		clearError: () => dispatch(clearError())
	};
}

export default connect<EnterPasswordStateProps, EnterPasswordModalProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(EnterPasswordModal);
