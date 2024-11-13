import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import { parseQueryParams } from 'ref/responsive/util/browser';
import { autoSignIn, registerAnonymousUser } from 'shared/account/sessionWorkflow';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { getNewsletters } from 'shared/service/action/newsletters';
import { CancelablePromise, makeCancelable } from 'shared/util/promises';
import { browserHistory } from 'shared/util/browserHistory';
import { getDeviceId } from 'shared/util/deviceUtil';
import { normalizeError } from 'shared/account/accountUtil';
import { setLoginSource, Providers } from '../../../util/authUtil';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import { SignupSteps } from 'toggle/responsive/pageEntry/account/accountUtils';
import { Gender } from 'toggle/responsive/pageEntry/account/ssoValidationUtil';
import { pageAnalyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { registrationStart, registrationComplete, ssoFormMounted } from 'shared/account/accountWorkflow';

import './CreateAccountForm.scss';

export const registerFormBem = new Bem('register-form');

interface State extends api.RegistrationRequestOmited {
	error: string;
	loading: boolean;
	step: number;
	previousStep: number;
	dateOfBirth?: string;
	gender?: Gender;
	isMounted: boolean;
}

interface StateProps {
	config: state.Config;
	signInPath: string;
	queryString: string;
	accountActive: boolean;
}

interface OwnProps {
	plan: api.Plan | undefined;
}

interface DispatchProps {
	autoSignIn: (justRegistered: boolean) => void;
	getNewsletters: () => Promise<any>;
	register: (body: api.RegistrationRequest) => Promise<any>;
	registrationStart: () => void;
	registrationComplete: (newsletters: string[]) => void;
	sendRegisterAnalyticsEvent: () => void;
	formMounted: (isMounted: boolean) => void;
}

type Props = OwnProps & DispatchProps & StateProps;

class CreateAccountForm extends React.Component<Props, State> {
	private pendingRequest: CancelablePromise<any>;

	constructor(props) {
		super(props);
		this.state = {
			step: SignupSteps.Registration,
			previousStep: SignupSteps.Registration,
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			loading: false,
			termsCondition: false,
			error: undefined,
			isMounted: false
		};
	}

	componentDidMount() {
		const { search, pathname } = window.location;
		let { step } = search && parseQueryParams(search);

		const { registrationStart, sendRegisterAnalyticsEvent } = this.props;
		if (!step || step === SignupSteps.Registration) {
			registrationStart();
		}

		sendRegisterAnalyticsEvent();

		if (step) {
			this.setState({ step: parseInt(step), loading: false });
		} else {
			browserHistory.replace(pathname);
		}
		this.setState({ isMounted: true }, () => this.props.formMounted(true));
	}

	componentWillUnmount() {
		if (this.pendingRequest) {
			this.pendingRequest.cancel();
			this.pendingRequest = undefined;
		}
		this.setState({ isMounted: false }, () => this.props.formMounted(false));
	}

	private completeRegistration = (config: api.RegistrationRequest) => {
		const { firstName, lastName, termsCondition, dateOfBirth, newsletters, gender, pin, email, password } = config;
		this.setState(
			{
				firstName,
				lastName,
				termsCondition,
				dateOfBirth,
				newsletters,
				gender,
				pin,
				email,
				password
			},
			this.createAccount
		);
	};

	render() {
		const { step, previousStep, loading } = this.state;
		const { config, accountActive } = this.props;
		const { isMounted } = this.state;
		if (!isMounted) {
			// tslint:disable-next-line: no-null-keyword
			return null;
		}
		if (step === SignupSteps.Registration) {
			return (
				<div>
					<RegisterStep1
						previousStep={previousStep}
						loading={loading}
						continueToNextStep={this.completeRegistration}
						signInPath={this.props.signInPath}
					/>
				</div>
			);
		}

		return <RegisterStep2 config={config} accountActive={accountActive} />;
	}

	private createAccount = () => {
		const { email, password, firstName, lastName, dateOfBirth, pin, newsletters, gender, termsCondition } = this.state;
		const deviceId = getDeviceId();
		const accountData = {
			email,
			password,
			firstName,
			lastName,
			dateOfBirth,
			pin,
			newsletters,
			gender,
			termsCondition,
			deviceId
		};
		const { register, autoSignIn } = this.props;
		this.setState({ loading: true });
		for (let accountProp of Object.keys(accountData)) {
			if (typeof accountData[accountProp] === 'undefined' || accountData[accountProp] === '')
				delete accountData[accountProp];
		}

		this.pendingRequest = makeCancelable(register(accountData));
		this.pendingRequest.promise
			.then(() => {
				this.setState({ step: SignupSteps.WelcomeMessage });
				browserHistory.replace(`${window.location.pathname}?step=${SignupSteps.WelcomeMessage}`);
				setLoginSource(Providers.MEDIACORP);
				autoSignIn(true);
				this.props.registrationComplete(newsletters);
			})
			.catch(err => {
				// Allows us to control how error handled: ie set state
				// before error is ultimately thrown
				const standardError = normalizeError(err);
				// Coversion required because errors from differing BE API's don't
				// have the same object structure, creating unhandled errors
				if (standardError.error) {
					this.setState({
						error: standardError.error,
						loading: false
					});
				}
				throw new Error(err);
			});
	};
}

function mapStateToProps({ app, page, account }: state.Root) {
	return {
		signInPath: getSignInPath(app.config),
		config: app.config,
		queryString: page.history.location.search,
		accountActive: !!(account && account.active)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		autoSignIn: (justRegistered: boolean) => dispatch(autoSignIn(justRegistered)),
		getNewsletters: () => dispatch(getNewsletters()),
		register: (body: api.RegistrationRequest) => dispatch(registerAnonymousUser(body)),
		registrationStart: () => dispatch(registrationStart()),
		registrationComplete: newsletters => dispatch(registrationComplete(undefined, newsletters)),
		sendRegisterAnalyticsEvent: () => dispatch(pageAnalyticsEvent(window.location.pathname)),
		formMounted: isMounted => dispatch(ssoFormMounted(isMounted))
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(CreateAccountForm);
