import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountDeviceAuthorization as key } from 'shared/page/pageKey';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { authorizeDevice } from 'shared/account/accountWorkflow';

import './AccountDeviceAuthorization.scss';

interface AccountDeviceAuthorizationProps extends PageProps {
	authorizeDevice?: (code: string) => any;
}

interface AccountDeviceAuthorizationState {
	code?: string;
	error?: string;
	authorizedDeviceName?: string;
}

const bem = new Bem('code-page');

class AccountDeviceAuthorization extends React.Component<
	AccountDeviceAuthorizationProps,
	AccountDeviceAuthorizationState
> {
	constructor(props) {
		super(props);
		this.state = {
			code: ''
		};
	}

	private onAuthorizeDevice = response => {
		if (response.error) {
			this.setState({ error: response.payload.message });
		} else {
			this.setState({
				error: undefined,
				authorizedDeviceName: response.payload.name
			});
		}
	};

	private onCodeChange = e => {
		this.setState({ code: e.target.value });
	};

	private onSubmit = (e?) => {
		if (e) e.preventDefault();
		const authorizeDevice = this.props.authorizeDevice;
		const code = this.state.code;
		if (authorizeDevice) {
			authorizeDevice(code).then(this.onAuthorizeDevice);
		}
	};

	render() {
		return (
			<div className={bem.b()}>
				<h2 className={bem.e('title')}>{this.props.title}</h2>
				{this.renderForm()}
			</div>
		);
	}

	private renderForm() {
		const { error, code, authorizedDeviceName } = this.state;
		if (authorizedDeviceName) {
			const values = { name: authorizedDeviceName };
			return (
				<IntlFormatter elementType="p" values={values}>
					{`@{codePage_success|Your device {name} has been authorized.}`}
				</IntlFormatter>
			);
		}
		return (
			<form onSubmit={this.onSubmit}>
				<IntlFormatter className={bem.e('label')} elementType="label">
					{`@{codePage_input_label|Enter code}:`}
				</IntlFormatter>
				<input className={bem.e('input')} name="code" value={code} onChange={this.onCodeChange} />
				{error && <p className={bem.e('error')}>{error}</p>}
				<IntlFormatter
					elementType={CtaButton}
					className={bem.e('submit')}
					onClick={this.onSubmit}
					componentProps={{ ordinal: 'primary', small: true }}
				>
					{'@{account_common_submit_button_label|Submit}'}
				</IntlFormatter>
			</form>
		);
	}
}

function mapDispatchToProps(dispatch: any) {
	return {
		authorizeDevice: code => dispatch(authorizeDevice(code, 'device'))
	};
}

export default configPage(AccountDeviceAuthorization, { theme: 'account', template, key, mapDispatchToProps });
