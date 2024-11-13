import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import LockIcon from 'ref/responsive/component/icons/LockIcon';
import CreatePinStepPinForm from './CreatePinStepPinForm';
import { CreatePinSteps } from './CreatePinOverlay';
import { default as CreatePinOverlay, CreatePinOverlayOwnProps } from './CreatePinOverlay';
import { redirectToMeConnectSettings } from 'shared/account/accountUtil';
import ModalTypes from 'shared/uiLayer/modalTypes';
import OpenBrowser from 'toggle/responsive/component/icons/OpenBrowser';
import ResetPin from './ResetPin';

import './AccountManagePinComponent.scss';

const bem = new Bem('account-manage-pin');
const MANAGE_PIN_ID = 'manage-pin';

interface Props {
	account: api.Account;
	showModal: (modal: ModalConfig) => void;
}

interface State {
	expanded: boolean;
	showResetPinForm: boolean;
}

/**
 * A: age >= 21
 * 	B: age from 18 to 20
 * 	C: age from 16 to 17
 * 	D: age < 16
 * 	E: not specified
 */

export enum AgeGroup {
	A = 'A',
	B = 'B',
	C = 'C',
	D = 'D',
	E = 'E'
}

export default class AccountManagePinComponent extends React.Component<Props, State> {
	state: State = {
		expanded: false,
		showResetPinForm: false
	};

	render() {
		const { showResetPinForm } = this.state;
		return (
			<div className={cx({ expanded: showResetPinForm })}>
				{showResetPinForm && <div className="gradient-top" />}
				{this.renderPinEntry()}
			</div>
		);
	}

	private hidePinForm = () => {
		this.setState({ expanded: false });
	};

	private createPinModal = () => {
		const { account, showModal } = this.props;

		const props: CreatePinOverlayOwnProps = {
			account,
			id: MANAGE_PIN_ID,
			changePin: account.pinEnabled,
			onSuccess: () => {
				this.setState({ expanded: account.pinEnabled });
			}
		};
		if (account.ageGroup !== AgeGroup.A) return;
		showModal({
			id: MANAGE_PIN_ID,
			type: ModalTypes.CUSTOM,
			element: <CreatePinOverlay {...props} />,
			disableAutoClose: true
		});
	};

	private showResetPinForm = () => {
		this.setState({ showResetPinForm: true });
	};

	private onCompletePinReset = () => {
		this.setState({ showResetPinForm: false });
	};

	private renderPinEntry() {
		const { account } = this.props;
		const { pinEnabled, ageGroup } = account;
		const { expanded, showResetPinForm } = this.state;

		const label = pinEnabled ? '@{account_a1_change_pin|Reset PIN}' : '@{account_a1_create_pin|Create PIN}';
		const onClick = pinEnabled ? this.showResetPinForm : this.createPinModal;

		return (
			<div className={cx(bem.b(), showResetPinForm ? 'gradient-background' : '')}>
				<IntlFormatter elementType="h4" className={bem.e('title')}>
					{'@{account_a1_pin_label|Control PIN}'}
				</IntlFormatter>
				<div className={bem.e('wrapper', { expanded: ageGroup !== AgeGroup.A })}>
					<IntlFormatter elementType="div" className={bem.e('description')}>
						{
							'@{account_a1_pin_description|This PIN is for verification purposes. This includes restricting access to rated content (NC16, M18) and unlocking R21 content.}'
						}
					</IntlFormatter>
					<div className={bem.e('container')}>
						<div className="parental-control-text">
							<div className={bem.e('child-control-text-container')}>
								<IntlFormatter elementType="div" className="label">
									<LockIcon className={bem.e('lock-icon')} />
									{'@{account_a1_parental_control_label|R21 content is locked by default.}'}
								</IntlFormatter>
								{!showResetPinForm && (
									<IntlFormatter
										tagName="span"
										onClick={() => {
											ageGroup === AgeGroup.A && onClick();
										}}
										disabled={true}
										className={bem.e('create-pin-btn', { 'is-active': ageGroup !== AgeGroup.A })}
									>
										{label}
									</IntlFormatter>
								)}
							</div>
							{ageGroup !== AgeGroup.A && ageGroup !== AgeGroup.E && (
								<IntlFormatter elementType="div" className={bem.e('create-pin-message')}>
									{'@{account_a1_create_pin_error_21_year_old|To create PIN, you need to be at least 21 years old.}'}
								</IntlFormatter>
							)}
							{ageGroup === AgeGroup.E && (
								<IntlFormatter elementType="div" className={bem.e('create-pin-message', { update: true })}>
									{'@{account_a1_create_pin_error_provide_dob|To create PIN, please provide your date of birth.}'}
									<IntlFormatter
										elementType="button"
										onClick={redirectToMeConnectSettings}
										className={bem.e('update-text')}
									>
										<IntlFormatter elementType="span" className={bem.e('create-pin-message-text')}>
											{'@{account_a1_create_pin_update_now|Update here}'}
										</IntlFormatter>
										<OpenBrowser className={bem.e('open-browser-icon')} />
									</IntlFormatter>
								</IntlFormatter>
							)}
						</div>
					</div>
					{expanded && (
						<CreatePinStepPinForm
							step={CreatePinSteps.Pin}
							account={account}
							continueToNextStep={this.hidePinForm}
							proceedBtnLabel={label}
							close={this.hidePinForm}
							changeExisting={true}
						/>
					)}
					{showResetPinForm && <ResetPin closePinResetForm={this.onCompletePinReset} showToastOnSuccess />}
				</div>
			</div>
		);
	}
}
