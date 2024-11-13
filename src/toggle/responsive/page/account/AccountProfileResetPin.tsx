import * as React from 'react';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountProfileResetPin as key } from 'shared/page/pageKey';
import configAccountPage from 'ref/responsive/page/account/common/configAccountPage';
import ResetPin from 'toggle/responsive/pageEntry/account/a1/pin/ResetPin';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';

import './AccountProfileResetPin.scss';

const bem = new Bem('profile-reset-pin');

interface StateProps {
	account: api.Account;
}

interface DispatchProps {
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
}

interface State {
	finished: boolean;
}

type Props = PageProps & StateProps & DispatchProps;

class AccountProfileResetPin extends React.Component<Props, State> {
	state = {
		finished: false
	};

	render() {
		return (
			<div className={bem.b()}>
				<section className="page-entry">
					<div className={bem.e('content')}>{this.renderContent()}</div>
				</section>
			</div>
		);
	}

	private renderContent() {
		if (this.state.finished) {
			return this.renderSuccess();
		} else {
			return <ResetPin closePinResetForm={this.onFinished} />;
		}
	}

	private renderSuccess() {
		this.props.showPassiveNotification({
			content: <IntlFormatter className={bem.e('toast')}>{'@{pin_reset_toast_label}'}</IntlFormatter>
		});
		return (
			<div className={bem.b()}>
				<IntlFormatter className={bem.e('title')} elementType="div">
					{'@{forgot-pin_pin-reset|PIN has been reset}'}
				</IntlFormatter>
			</div>
		);
	}

	private onFinished = () => {
		this.setState({ finished: true });
		window.scrollTo({ top: 0 });
	};
}

function mapStateToProps({ account, profile }: state.Root): StateProps {
	return { account: account.info };
}
const mapDispatchToProps = (dispatch): DispatchProps => ({
	showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
		dispatch(ShowPassiveNotification(config))
});

export default configAccountPage(AccountProfileResetPin, { template, key, mapStateToProps, mapDispatchToProps }, false);
