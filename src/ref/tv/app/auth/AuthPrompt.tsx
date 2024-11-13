import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SignIn from '../../page/account/signin/SignIn';
import SignOutPrompt from '../../page/account/signout/SignOutPrompt';
import SignInSucPrompt from '../../page/account/signin/SignInSucPrompt';
import SwitchProfileModal from 'ref/tv/component/modal/SwitchProfileModal';
import { EditProfileModal } from 'ref/tv/component/modal/account/EditProfileModal';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { cancelPrompt, signOut } from 'shared/account/sessionWorkflow';
import { renewDeviceCode } from 'shared/account/deviceWorkflow';
import { newProfile, editProfile, deleteProfile } from 'shared/account/profileEditWorkflow';
import { CREATE_PROFILE, UPDATE_PROFILE_WITH_ID } from 'shared/service/action/account';
import { clearError } from 'shared/app/appWorkflow';

type AuthPromptProps = {};

type AuthPromptStateProps = {
	prompt: Prompt<string[]>;
	isSignedIn: boolean;
	account: state.Account;
	profile: state.Profile;
	mandatorySignIn: boolean;
	url: string;
	error: Action<any>[];
};

type AuthPromptDispatchProps = {
	cancelPrompt: () => void;
	renewDeviceCode: () => void;
	signOut: (redirectPath?: string) => void;
	newProfile: (name: string, pinEnabled: boolean, tags: string[]) => any;
	editProfile: (id: string, name: string, pinEnabled: boolean, tags: string[]) => any;
	deleteProfile: (id: string) => any;
	clearError: () => any;
};

export class AuthPrompt extends React.Component<AuthPromptProps & AuthPromptStateProps & AuthPromptDispatchProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	constructor(props: any) {
		super(props);

		this.state = {};
	}

	componentWillReceiveProps(nextProps: AuthPromptProps & AuthPromptStateProps & AuthPromptDispatchProps) {
		if (nextProps.error) {
			let errorMsg;
			const error = this.getErroredQueries(nextProps.error) as any[];
			if (error && error.length > 0) {
				errorMsg = error[0].message;
			}

			this.setState({ errorMsg });
		}
	}

	private onSignOutPrompt = () => {
		this.props.signOut('/');
	};

	private onSignInPromptBack = () => {
		if (!this.props.mandatorySignIn) {
			this.props.cancelPrompt();
		}
	};

	private cancelPrompt = () => {
		this.props.cancelPrompt();
	};

	private onRenew = () => {
		this.props.renewDeviceCode();
	};

	private getErroredQueries(erroredActions: Action<any>[]): string[] {
		return erroredActions.reduce((erroredQueries: string[], action: Action<any>) => {
			if (action.type === CREATE_PROFILE || action.type === UPDATE_PROFILE_WITH_ID) {
				erroredQueries.push(action.payload as any);
			}
			return erroredQueries;
		}, []);
	}

	render() {
		const prompt = this.props.prompt;

		if (!prompt) {
			return <span />;
		}

		switch (prompt.type) {
			case 'gencode':
			case 'gencode_ok':
				return <SignIn code={prompt['code'] || '...'} onBack={this.onSignInPromptBack} />;

			case 'action_request':
				return <SignIn code={prompt['code']} onBack={this.onSignInPromptBack} needsAction={true} />;

			case 'code_expired':
				return (
					<SignIn code={prompt['code']} onBack={this.onSignInPromptBack} onRenew={this.onRenew} isExpiredMode={true} />
				);

			case 'signin_suc':
				return <SignInSucPrompt onBack={this.cancelPrompt} />;

			case 'choose_profile':
				setImmediate(() => {
					this.context.focusNav.showDialog(
						<SwitchProfileModal account={this.props.account} isInSigninProcess={true} />
					);
				});

				return <div />;

			case 'signOut':
				return <SignOutPrompt onSignOut={this.onSignOutPrompt} onBack={this.cancelPrompt} />;

			case 'edit_profile_start':
				const index = this.props.account.info.profiles.findIndex(p => p.id === prompt.id);
				const profile = index >= 0 && this.props.account.info.profiles[index];
				const disableDelete = index === 0 || (profile && profile.id === this.props.profile.info.id);
				return (
					<EditProfileModal
						baseState={'start'}
						profile={profile}
						account={this.props.account.info}
						onBack={this.cancelPrompt}
						disableDelete={disableDelete}
						editProfile={this.props.editProfile}
						deleteProfile={this.props.deleteProfile}
						url={this.props.url}
						errorMsg={this.state.errorMsg}
						clearError={this.props.clearError}
					/>
				);
			case 'new_profile':
				return (
					<EditProfileModal
						baseState={'new'}
						account={this.props.account.info}
						onBack={this.cancelPrompt}
						newProfile={this.props.newProfile}
						url={this.props.url}
						errorMsg={this.state.errorMsg}
						clearError={this.props.clearError}
					/>
				);
			default:
				return <span />;
		}
	}
}

function mapStateToProps(state: state.Root): AuthPromptStateProps {
	const { account, profile } = state;
	return {
		prompt: state.session.authPrompts[0],
		account,
		profile,
		isSignedIn: !!account && account.active,
		mandatorySignIn: state.app.config.general.mandatorySignIn,
		url: state.app.config.general.websiteUrl,
		error: state.app.erroredActions
	};
}

function mapDispatchToProps(dispatch: any): AuthPromptDispatchProps {
	return {
		cancelPrompt: () => dispatch(cancelPrompt()),
		renewDeviceCode: () => dispatch(renewDeviceCode()),
		signOut: (redirectPath?: string) => dispatch(signOut(redirectPath)),
		newProfile: (name: string, pinEnabled: boolean, tags: string[]) => dispatch(newProfile(name, pinEnabled, tags)),
		editProfile: (id: string, name: string, pinEnabled: boolean, tags: string[]) =>
			dispatch(editProfile(id, name, pinEnabled, tags)),
		deleteProfile: (id: string) => dispatch(deleteProfile(id)),
		clearError: () => dispatch(clearError())
	};
}

export default connect<AuthPromptStateProps, AuthPromptDispatchProps, AuthPromptProps>(
	mapStateToProps,
	mapDispatchToProps
)(AuthPrompt);
