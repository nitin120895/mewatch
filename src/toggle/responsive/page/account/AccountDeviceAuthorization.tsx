import * as React from 'react';
import { browserHistory } from 'shared/util/browserHistory';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { AccountDeviceAuthorization as key } from 'shared/page/pageKey';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { authorizeDevice } from 'shared/account/accountWorkflow';
import { validateDeviceName } from 'shared/account/accountUtil';
import DeviceCodeInput from './registration/DeviceCodeInput';
import TextInput from 'ref/responsive/component/input/TextInput';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Account } from 'shared/page/pageKey';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import {
	DeviceAuthError,
	getDeviceAuthErrorByCode,
	isDeviceLimitError,
	isInvalidCodeError
} from 'shared/util/deviceUtil';
import { get } from 'shared/util/objects';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';

import './AccountDeviceAuthorization.scss';

interface StateProps {
	config: state.Config;
	code: string;
}

interface DispatchProps {
	authorizeDevice: (body: api.DeviceAuthorizationRequest) => Promise<any>;
	sendRegisterAnalyticsEvent: () => void;
}

interface State {
	code: string;
	errorType?: DeviceAuthError;
	authorizedDeviceName: string;
	touched: {
		code: boolean;
		deviceName: boolean;
	};
	deviceName: string;
	deviceCodeValid: boolean;
	submitting: boolean;
}

type Props = PageProps & StateProps & DispatchProps;

const bem = new Bem('code-page');

class AccountDeviceAuthorization extends React.Component<Props, State> {
	state = {
		code: '',
		errorType: undefined,
		authorizedDeviceName: '',
		touched: {
			code: false,
			deviceName: false
		},
		deviceName: '',
		deviceCodeValid: false,
		submitting: false
	};

	componentDidMount() {
		this.props.sendRegisterAnalyticsEvent();
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
		const { deviceName } = this.state.touched;
		if (!prevState.touched.deviceName && deviceName) {
			this.validate();
		}
	}

	private onTextBlur = e => {
		const { touched } = this.state;
		const { name } = e.target;
		this.setState({ touched: { ...touched, [name]: true } });
	};

	private onTextChange = e => {
		const newState = {};
		newState[e.target.name] = e.target.value.trim();
		this.setState(newState);
	};

	private onSubmit = (e?) => {
		const { touched } = this.state;
		if (e) e.preventDefault();
		const authorizeDevice = this.props.authorizeDevice;
		const { code, deviceName: name } = this.state;

		this.setState({ touched: { ...touched, deviceName: true, code: true } });

		if (this.validate() && authorizeDevice) {
			this.setState({ submitting: true });
			authorizeDevice({ code, name })
				.then(this.onAuthorizeDevice)
				.catch(this.onError);
		}
	};

	private onAuthorizeDevice = ({ meta, payload }) => {
		if (meta.res.status !== 200) return Promise.reject(meta.res.status);

		this.setState({
			errorType: undefined,
			submitting: false,
			authorizedDeviceName: this.state.deviceName
		});

		return payload.id;
	};

	private onError = (code: number) => {
		const errorType = getDeviceAuthErrorByCode(code);

		this.setState({ errorType, submitting: false });
	};

	private onCancel = () => {
		const path = getPathByKey(Account, this.props.config);
		browserHistory.push(path);
	};

	private validate = (): boolean => {
		const { deviceName, touched, deviceCodeValid } = this.state;
		return validateDeviceName(deviceName, touched).displayState !== 'error' && deviceName && deviceCodeValid;
	};

	private refreshCodeValid = (isValid: boolean) => {
		this.setState({ deviceCodeValid: isValid });
	};

	render() {
		const { authorizedDeviceName } = this.state;
		return <div className={bem.b()}>{authorizedDeviceName ? this.renderSucess() : this.renderForm()}</div>;
	}

	private renderSucess() {
		const { authorizedDeviceName } = this.state;
		const values = { name: authorizedDeviceName };
		return (
			<div>
				<IntlFormatter elementType="h2" className={bem.e('title')}>
					{`@{codePage_success_title|Connected!}`}
				</IntlFormatter>
				<IntlFormatter elementType="span" values={values} className={bem.e('subtitle')}>
					{`@{codePage_success_subtitle|{name} has been added. You can start watching your favourite shows on this device.}`}
				</IntlFormatter>
			</div>
		);
	}

	private renderForm() {
		const { touched, deviceName, submitting, errorType } = this.state;
		const { code } = this.props;
		const { displayState: displayStateDeviceName, message: messageDeviceName } = validateDeviceName(
			deviceName,
			touched
		);

		return (
			<form onSubmit={this.onSubmit} className={bem.e('form-code')}>
				<IntlFormatter elementType="h2" className={bem.e('title')}>
					{`@{codePage_title|Add A New TV}`}
				</IntlFormatter>
				<IntlFormatter elementType="span" className={bem.e('subtitle')}>
					{`@{codePage_subtitle|To add a new TV, enter the 5-digit alphanumeric code found on the sign-in screen of the mewatch TV app.}`}
				</IntlFormatter>

				{isInvalidCodeError(errorType) && this.renderValidationError()}

				<DeviceCodeInput
					className={bem.e('input-code')}
					name="code"
					onChange={this.onTextChange}
					isValid={this.refreshCodeValid}
					initialValue={code}
					setTouched={touched.code}
					displayState={isInvalidCodeError(errorType) ? 'error' : 'default'}
				/>
				<TextInput
					id="deviceName"
					name="deviceName"
					maxLength={16}
					displayState={displayStateDeviceName}
					required={true}
					type="text"
					label={'@{codePage_device_name_placeholder|TV name (required)}'}
					disabled={false}
					onChange={this.onTextChange}
					onBlur={this.onTextBlur}
					message={messageDeviceName}
					value={deviceName}
					className={bem.e('input-name', { error: displayStateDeviceName === 'error' })}
				/>

				{isDeviceLimitError(errorType) && this.renderDeviceLimitError()}

				<IntlFormatter className={bem.e('specification')}>
					{`@{codePage_device_name_specification|A maximum of 16 characters & no special symbols are allowed}`}
				</IntlFormatter>
				<IntlFormatter
					elementType={AccountButton}
					componentProps={{
						onClick: this.onSubmit,
						type: 'button',
						ordinal: 'primary',
						theme: 'dark',
						disabled: submitting,
						loading: submitting,
						className: bem.e('connect')
					}}
				>
					{!submitting && '@{codePage_connect|Add}'}
					{submitting && '@{codePage_connecting|Adding}'}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					className={bem.e('cancel')}
					onClick={this.onCancel}
					disabled={submitting}
					componentProps={{ theme: 'light' }}
				>
					{'@{codePage_cancel|Cancel}'}
				</IntlFormatter>
			</form>
		);
	}

	private renderValidationError() {
		return (
			<IntlFormatter className={bem.e('error')}>
				{`@{codePage_device_name_invalid_code|You have entered an invalid code. Please try again.}`}
				<div className={bem.e('error-circle')}>!</div>
			</IntlFormatter>
		);
	}

	private renderDeviceLimitError() {
		return (
			<div className={bem.e('error', 'device-limit')}>
				<IntlFormatter elementType="div" className={bem.e('error-title')}>
					{`@{codePage_device_device_limit_title}`}
				</IntlFormatter>
				<IntlFormatter elementType="div">{`@{codePage_device_device_limit_body}`}</IntlFormatter>
				<div className={bem.e('error-circle')}>!</div>
			</div>
		);
	}
}

function mapStateToProps({ app, page }: state.Root): StateProps {
	return {
		config: app.config,
		code: get(page, 'history.location.query.code')
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		authorizeDevice: (body: api.DeviceAuthorizationRequest) => dispatch(authorizeDevice(body.code, body.name)),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname))
	};
}

export default configPage(AccountDeviceAuthorization, {
	theme: 'watch',
	template,
	key,
	mapStateToProps,
	mapDispatchToProps
});
