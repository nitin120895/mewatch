import * as React from 'react';
import { findDOMNode } from 'react-dom';
import PwdInput from 'ref/responsive/component/input/PasswordInput';
import Accordion from 'ref/responsive/component/Accordion';
import AccountActionButtons from '../../common/AccountActionButtons';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import MaskSection from './MaskSection';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import * as cx from 'classnames';
import { A1DetailsError } from '../A1Details';
import { GET_ACCOUNT_TOKEN } from 'shared/service/action/authorization';

import './ChangePassword.scss';

interface ChangePasswordProps {
	onDisplayPwdForm: () => void;
	onClose: () => void;
	onUpdatePassword?: (currentPassword: string, newPassword: string) => void;
	isOpen: boolean;
	updating?: boolean;
	error?: A1DetailsError;
}

interface ChangePasswordState {
	currentPassword?: string;
	newPassword?: string;
	error?: A1DetailsError;
}

const bem = new Bem('a1-pwd');
const bemAccordion = new Bem('account-panel-section');

export default class ChangePassword extends React.Component<ChangePasswordProps, ChangePasswordState> {
	static defaultProps = {
		onUpdatePassword: noop
	};

	state: ChangePasswordState = {
		newPassword: '',
		currentPassword: ''
	};

	private currentPwdInput: HTMLInputElement;

	componentWillReceiveProps(nextProps: ChangePasswordProps) {
		if (!this.props.error && nextProps.error) {
			this.setState({ error: nextProps.error });
		} else if (this.props.error && !nextProps.error) {
			this.setState({ error: undefined });
		}
	}

	private resetState() {
		this.setState({
			newPassword: '',
			currentPassword: ''
		});
	}

	private onChange = e => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	};

	private onUpdatePassword = () => {
		const { currentPassword, newPassword } = this.state;
		this.props.onUpdatePassword(currentPassword, newPassword);
	};

	private onReference = ref => {
		if (ref) {
			this.currentPwdInput = findDOMNode<HTMLInputElement>(ref);
		}
	};

	private onTransitionEnd = () => {
		this.currentPwdInput.focus();
		if (!this.props.isOpen) this.resetState();
	};

	private onInputFocused = () => {
		this.setState({ error: undefined });
	};

	render() {
		const { onClose, onDisplayPwdForm, isOpen, updating } = this.props;
		const { error, newPassword, currentPassword } = this.state;
		const openTransition = isOpen ? 'account-accordion-large' : 'account-accordion-small';
		const closeTransition = isOpen ? 'account-accordion-small' : 'account-accordion-large';

		// CTA buton enabled when user input PIN and at least 6 characters of password
		const disabled = !(newPassword && newPassword.length >= 6 && currentPassword && currentPassword.length >= 6);

		// we need to differentiate error types to highlight corresponding input fields properly
		const isGetTokenError = error && error.type === GET_ACCOUNT_TOKEN;
		const isChangePwdError = error && error.type !== GET_ACCOUNT_TOKEN;

		return (
			<div className={cx(bem.b(), bemAccordion.b({ expanded: isOpen, collapsed: !isOpen }), 'row-flush')}>
				<Accordion
					activeKey={isOpen ? 'pwd-form' : 'pwd-mask'}
					oneAtATime
					onOpenTransitionClass={openTransition}
					onCloseTransitionClass={closeTransition}
					onTransitionEnd={this.onTransitionEnd}
				>
					<div key="pwd-form">
						<div className={cx('acct-form', 'row-nudge', bemAccordion.e('large'))}>
							<IntlFormatter elementType="h4" className={bem.e('title')}>
								{`@{account_a1_change_password_label|PasswordX}`}
							</IntlFormatter>
							<PwdInput
								type="text"
								displayState={isGetTokenError ? 'error' : 'default'}
								id="text-input-current"
								name="currentPassword"
								label={'@{account_a1_verification_current_password|Current Password}'}
								onReference={this.onReference}
								onChange={this.onChange}
								onFocus={this.onInputFocused}
								value={currentPassword}
								message={isGetTokenError ? error.message : undefined}
							/>
							<PwdInput
								type="text"
								displayState={isChangePwdError ? 'error' : 'default'}
								id="text-input-change"
								name="newPassword"
								label={'@{account_a1_change_password_new_label|New Password}'}
								onChange={this.onChange}
								onFocus={this.onInputFocused}
								value={newPassword}
								message={isChangePwdError ? error.message : '@{form_newPassword_step2_passwordRequirements}'}
							/>
							<AccountActionButtons
								primaryLabel={'@{account_a1_change_password_button_label|Change Password}'}
								onSubmit={this.onUpdatePassword}
								onCancel={onClose}
								loading={updating}
								disabled={disabled}
							/>
						</div>
					</div>
					<div key="pwd-mask" className="row-nudge">
						<MaskSection
							className={bemAccordion.e('small')}
							onClick={onDisplayPwdForm}
							label={'@{account_a1_change_password_label|Password}'}
							labelChange={'@{account_a1_change_password_button_label|Change Password}'}
							value={'00000000000000'}
						/>
					</div>
				</Accordion>
			</div>
		);
	}
}
