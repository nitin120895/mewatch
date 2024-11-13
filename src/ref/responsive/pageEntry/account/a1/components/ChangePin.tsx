import * as React from 'react';
import PinInput from 'ref/responsive/component/input/PinInput';
import PwdInput from 'ref/responsive/component/input/PasswordInput';
import Accordion from 'ref/responsive/component/Accordion';
import AccountActionButtons from '../../common/AccountActionButtons';
import MaskSection from './MaskSection';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { noop } from 'shared/util/function';
import { A1DetailsError } from '../A1Details';

import './ChangePin.scss';

interface ChangePinProps {
	onDisplayPinForm: () => void;
	onCancel: () => void;
	onUpdatePin: (currentPassword: string, pin: string) => void;
	isOpen: boolean;
	updating?: boolean;
	pinEnabled: boolean;
	error?: A1DetailsError;
}

interface ChangePinState {
	currentPassword?: string;
	newPin?: number[];
	error?: A1DetailsError;
}

const bem = new Bem('a1-pin');
const bemAccordion = new Bem('account-panel-section');

export default class ChangePin extends React.Component<ChangePinProps, ChangePinState> {
	static defaultProps = {
		onUpdatePin: noop
	};

	state: ChangePinState = {
		newPin: [],
		currentPassword: ''
	};

	componentWillReceiveProps(nextProps: ChangePinProps) {
		if (!this.props.error && nextProps.error) {
			this.setState({ error: nextProps.error });
		} else if (this.props.error && !nextProps.error) {
			this.setState({ error: undefined });
		}
	}

	private resetState() {
		this.setState({
			newPin: [],
			currentPassword: ''
		});
	}

	private onInputFocused = () => {
		this.setState({ error: undefined });
	};

	private updatePin = () => {
		this.props.onUpdatePin(this.state.currentPassword, this.state.newPin.join(''));
	};

	private onPinChange = (newPin: number[]) => {
		this.setState({ newPin });
	};

	private onChange = e => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onTransitionEnd = () => {
		if (!this.props.isOpen) this.resetState();
	};

	private isPINFilled() {
		const { newPin } = this.state;
		return newPin && newPin.length === 4 && newPin.every(digit => !!digit);
	}

	render() {
		const { onCancel, onDisplayPinForm, isOpen, pinEnabled, updating } = this.props;
		const { error, newPin, currentPassword } = this.state;
		const openTransition = isOpen ? 'account-accordion-large' : 'account-accordion-small';
		const closeTransition = isOpen ? 'account-accordion-small' : 'account-accordion-large';
		const pinLabel = pinEnabled
			? '@{account_a1_reset_pin_button_label|Change Pin}'
			: '@{account_a1_create_pin_button_label|Create Pin}';
		const maskLabel = !pinEnabled ? '@{account_a1_pin_has_not_been_set_label| PIN has not been set}' : undefined;

		// CTA buton enabled when user input PIN and at least 6 characters of password
		const disabled = !(this.isPINFilled() && currentPassword && currentPassword.length >= 6);

		return (
			<div className={cx(bem.b(), bemAccordion.b({ expanded: isOpen, collapsed: !isOpen }), 'row-flush')}>
				<Accordion
					activeKey={isOpen ? 'pin-form' : 'pin-mask'}
					oneAtATime
					onOpenTransitionClass={openTransition}
					onCloseTransitionClass={closeTransition}
					onTransitionEnd={this.onTransitionEnd}
				>
					<div key="pin-form">
						<div className={cx('acct-form', 'row-nudge', bemAccordion.e('large'))}>
							<IntlFormatter elementType="h4" className={bem.e('title')}>
								{`@{account_a1_pin_label|Pin}`}
							</IntlFormatter>
							<PinInput
								pinLength={4}
								digits={newPin}
								onChange={this.onPinChange}
								label={'@{account_a1_new_pin_label|Select A New Pin}'}
							/>
							<IntlFormatter elementType="h4" className={bem.e('text')}>
								{'@{account_a1_change_pin_password_confirm}'}
							</IntlFormatter>
							<PwdInput
								type="text"
								displayState={error ? 'error' : 'default'}
								label="Password"
								onChange={this.onChange}
								id="pin-input-change"
								name="currentPassword"
								onFocus={this.onInputFocused}
								value={currentPassword}
								message={error ? error.message : undefined}
							/>
							<AccountActionButtons
								primaryLabel={'@{account_a1_set_pin_button_label|Set Pin}'}
								onSubmit={this.updatePin}
								onCancel={onCancel}
								loading={updating}
								disabled={disabled}
							/>
						</div>
					</div>
					<div key="pin-mask" className="row-nudge">
						<MaskSection
							className={bemAccordion.e('small')}
							onClick={onDisplayPinForm}
							label={'@{account_a1_pin_label|Pin}'}
							labelChange={pinLabel}
							value={'0000'}
							maskLabel={maskLabel}
						/>
					</div>
				</Accordion>
			</div>
		);
	}
}
