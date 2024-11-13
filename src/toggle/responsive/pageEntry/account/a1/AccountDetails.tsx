import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { A1Details as template } from 'shared/page/pageEntryTemplate';
import AccountManagePinComponent from './pin/AccountManagePinComponent';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import CtaButton from 'ref/responsive/component/CtaButton';
import { redirectToMeConnectSettings } from 'shared/account/accountUtil';

import './AccountDetails.scss';

interface OwnProps extends PageEntryPropsBase {
	account: api.Account;
	activeProfile?: api.ProfileDetail;
}

interface DispatchProps {
	showModal: (modal: ModalConfig) => void;
}

type Props = OwnProps & DispatchProps;

const bem = new Bem('account-detail');

class A1Details extends React.Component<Props, {}> {
	constructor(props) {
		super(props);
	}

	render() {
		const { account, showModal } = this.props;

		return (
			<div className="form-white">
				<AccountEntryWrapper
					buttonLabel={'@{meconnect_manage_account|Manage meconnect account}'}
					buttonDisabled={false}
					buttonTip={'@{meconnect_manage_tooltip|Update profile, change password, delete account and more}'}
					onClick={redirectToMeConnectSettings}
					{...this.props}
				>
					<IntlFormatter elementType="div" className={bem.b()}>
						{this.renderProfileInformation()}
						<div className={bem.e('button-section')}>
							{this.renderButton()}
							{this.renderButtonTip()}
						</div>
						<AccountManagePinComponent account={account} showModal={showModal} />
					</IntlFormatter>
				</AccountEntryWrapper>
			</div>
		);
	}

	private renderProfileInformation() {
		const { account } = this.props;
		if (!account) return;

		return (
			<div className={bem.e('info')}>
				<div className={bem.e('entryName')}>
					{account.firstName} {account.lastName}
				</div>
				<div className={bem.e('entry')}>
					<div className="email">{account.email}</div>
				</div>
			</div>
		);
	}

	private renderButton() {
		return (
			<IntlFormatter
				elementType={CtaButton}
				className={bem.e('action-btn')}
				disabled={false}
				onClick={redirectToMeConnectSettings}
				componentProps={{
					ordinal: 'secondary'
				}}
			>
				{'@{meconnect_manage_account|Manage meconnect Account}'}
			</IntlFormatter>
		);
	}

	private renderButtonTip() {
		return (
			<IntlFormatter className={bem.e('btn-tip')}>
				{'@{meconnect_manage_tooltip|Update profile, change password, delete account and more}'}
			</IntlFormatter>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

const Component: any = connect<any, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(A1Details);
Component.template = template;

export default Component;
