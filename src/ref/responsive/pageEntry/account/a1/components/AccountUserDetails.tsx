import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import Spinner from 'ref/responsive/component/Spinner';
import { noop } from 'shared/util/function';

import './AccountUserDetails.scss';

interface UserDetailsProps {
	firstName: string;
	lastName: string;
	email: string;
	onRequestVerification?: () => void;
	requestStatus: 'sending' | 'sent' | 'failed';
	emailVerified: boolean;
}

const bem = new Bem('a1-user');
const TICK_PATH = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';

export default class AccountUserDetails extends React.Component<UserDetailsProps, any> {
	static defaultProps = {
		onRequestVerification: noop,
		firstName: '',
		lastName: '',
		email: '',
		emailVerified: false
	};

	handleSendVerification = () => {
		this.props.onRequestVerification();
	};

	render() {
		const { firstName, lastName, email, requestStatus, emailVerified } = this.props;
		return (
			<div className={bem.e('details')}>
				<p className={bem.e('name')}>{`${firstName} ${lastName}`}</p>
				<div className={bem.e('verification')}>
					<span className={bem.e('email')} key="email">
						{email}
					</span>
					{this.renderEmailVerificationStatus(requestStatus, emailVerified)}
					{this.renderEmailVerificationMessage(requestStatus)}
				</div>
			</div>
		);
	}

	private renderEmailVerificationStatus(requestStatus: UserDetailsProps['requestStatus'], emailVerified: boolean) {
		if (emailVerified) {
			return (
				<IntlFormatter tagName="span" className={bem.e('message', 'verified')} key="verified">
					{'@{account_a1_email_verified_label|Email Verified}'}
				</IntlFormatter>
			);
		} else {
			return (
				!requestStatus && (
					<IntlFormatter
						tagName="span"
						className={bem.e('message', 'link')}
						onClick={this.handleSendVerification}
						key="resendLink"
					>
						{'@{account_a1_verification_resend_verification_label|Resend Verification}'}
					</IntlFormatter>
				)
			);
		}
	}

	private renderEmailVerificationMessage(message: UserDetailsProps['requestStatus']) {
		switch (message) {
			case 'sending':
				return (
					<span className={bem.e('message')} key="message">
						<span className={bem.e('spinner')} key="spinner">
							<Spinner />
						</span>
						<IntlFormatter tagName="span" className={bem.e('sending')} key="sending">
							{'@{account_a1_verification_sending_verification_label|Sending Verification}'}
						</IntlFormatter>
					</span>
				);
			case 'sent':
				return (
					<span className={bem.e('sentBlock')} key="sentBlock">
						<span className={bem.e('message')} key="message">
							<span className={bem.e('tick-positioner')} key="tick">
								<SVGPathIcon className={bem.e('send-tick')} width="23" height="23" data={TICK_PATH} />
							</span>
							<IntlFormatter className={bem.e('sent')} key="sentMessage">
								{'@{account_a1_verification_sent_verification_label|Verification Sent}'}
							</IntlFormatter>
						</span>
						<IntlFormatter className={bem.e('link')} onClick={this.handleSendVerification} key="sendAgain">
							{'@{account_a1_verification_sent_send_again_label|Send Again}'}
						</IntlFormatter>
					</span>
				);
			case 'failed':
				return (
					<span className={bem.e('failedBlock')} key="failedBlock">
						<span className={bem.e('message', 'failed')} key="failedMessage">
							<span className={bem.e('icon-failed')} key="iconFailed">
								!
							</span>
							<IntlFormatter className={bem.e('sent')} key="sentMessage">
								{'@{account_a1_verification_failed_verification_label|Sending Verification Failed}'}
							</IntlFormatter>
						</span>
						<IntlFormatter className={bem.e('link')} onClick={this.handleSendVerification} key="tryAgain">
							{'@{account_common_try_again_label|Try Again}'}
						</IntlFormatter>
					</span>
				);
		}
	}
}
