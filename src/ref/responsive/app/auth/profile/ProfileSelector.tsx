import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import ProfilePinPrompt from './ProfilePinPrompt';
import Selector from './ProfilesPrompt';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import * as AppActions from 'shared/app/appWorkflow';
import * as SessionActions from 'shared/account/sessionWorkflow';

import './ProfileSelector.scss';

const bem = new Bem('profile-selector');

interface ProfileSelectorProps extends React.Props<PageEntryPropsBase> {
	switchProfile?: (profile: api.ProfileSummary, pin?: string) => any;
	setAppTheme?: (theme: AppTheme) => void;
	account?: api.Account;
	enabled?: boolean;
	currentAppTheme?: AppTheme;
}

interface ProfileSelectorState {
	prevAppTheme?: AppTheme;
	pin: number[];
	selectedProfile: api.ProfileSummary;
	error: string;
	showPin: boolean;
	loading: boolean;
}

function setDefaultProfileWhenSingle(props: ProfileSelectorProps) {
	const { account } = props;
	if (account && account.profiles.length === 1) {
		// auto-select the first profile if it's the only one
		props.switchProfile(account.profiles[0]);
	}
}

const hid = 'profile-switcher-heading';

const errorMap = {
	[4]: '@{profileSelector_error_invalidPin|Incorrect PIN provided}',
	[9]: '@{profileSelector_error_lockedProfile|This profile is locked}'
};

class ProfileSelector extends React.Component<ProfileSelectorProps, ProfileSelectorState> {
	private initState: ProfileSelectorState = {
		pin: undefined,
		selectedProfile: undefined,
		error: undefined,
		showPin: false,
		loading: false
	};

	constructor(props: ProfileSelectorProps) {
		super(props);
		this.state = {
			...this.initState,
			prevAppTheme: props ? props.currentAppTheme : undefined
		};
	}

	componentWillMount() {
		if (this.props.enabled) {
			this.props.setAppTheme('profiles');
		}
	}

	componentDidMount() {
		setDefaultProfileWhenSingle(this.props);
	}

	componentWillReceiveProps(nextProps: ProfileSelectorProps) {
		if (this.props.enabled !== nextProps.enabled) {
			const newState: ProfileSelectorState = this.initState;
			// Update App Theme
			if (nextProps.enabled) {
				// Store previous theme for later restoration
				if (nextProps.currentAppTheme !== 'profiles') newState.prevAppTheme = nextProps.currentAppTheme;
				// Set theme to profiles while the user chooses their profile
				nextProps.setAppTheme('profiles');
			} else {
				// Restore the previous theme if returning to the same page, or sometimes a redirect occurs resulting in a
				// different page theme so we favour the new page's theme over the previous page's theme from stored state.
				const nextTheme =
					nextProps.currentAppTheme !== 'profiles' ? nextProps.currentAppTheme : this.state.prevAppTheme;
				this.props.setAppTheme(nextTheme);

				// scroll to top in case user scrolled down for profile selection
				ReactDOM.findDOMNode(this).scrollTop = 0;
			}
			// Update pending state
			this.setState(newState);
		}

		if (!this.props.account && nextProps.account) setDefaultProfileWhenSingle(nextProps);
	}

	private onProfileSelect = (selectedProfile: api.ProfileSummary) => {
		if (selectedProfile.isRestricted) {
			this.setState({ selectedProfile, showPin: true });
			return;
		}
		this.switchProfile(selectedProfile);
	};

	private switchProfile(selectedProfile) {
		const pin = this.state.pin ? this.state.pin.join('') : undefined;
		if (pin) this.setState({ loading: true });

		this.props.switchProfile(selectedProfile, pin).catch((error: api.ServiceError) => {
			let state = { loading: false, error: undefined };
			if (errorMap[error.code]) state.error = errorMap[error.code];
			this.setState(state);
		});
	}

	private onPinChange = pin => this.setState({ pin });
	private onPinCancel = () =>
		this.setState({
			pin: undefined,
			error: undefined,
			showPin: false,
			loading: false
		});
	private onPinSubmit = e => {
		e.preventDefault();
		this.switchProfile(this.state.selectedProfile);
	};
	private onPinInteract = () => {
		this.setState({
			error: undefined
		});
	};

	render() {
		const { enabled, account } = this.props;
		const { selectedProfile, pin, error, loading, showPin } = this.state;

		let name;
		if (selectedProfile) name = selectedProfile.name;
		// Usually we'd abort rendering at this point if it's not `enabled`, however that would bypass the cleanup
		// and focus restoration logic within FocusCaptureGroup. Instead we always render the shell (albeit hidden
		// when disabled) and simply skip the rendering of profiles when it's inactive to ensure focus is put back
		// where it should be upon selecting a profile and closing this modal layer.
		return (
			<div
				className={cx(bem.b({ locked: showPin }), { hidden: !enabled })}
				role="dialog"
				aria-hidden={!enabled}
				aria-labelledby={hid}
			>
				<div className={bem.e('logo-wrap')}>
					<BrandLogo className={cx(bem.e('logo'), 'grid-margin')} id="brand-logo" role="presentation" />
				</div>
				<div className={bem.e('selector', { visible: !showPin })}>
					<section className={bem.e('container')}>
						<FocusCaptureGroup focusable={enabled} autoFocus={false}>
							<Selector
								account={account}
								enabled={enabled}
								hid={hid}
								onProfileSelect={this.onProfileSelect}
								selectedProfile={selectedProfile}
								showPin={showPin}
							/>
						</FocusCaptureGroup>
					</section>
				</div>
				<div className={bem.e('pin-prompt', { visible: showPin })}>
					<section className={bem.e('container')}>
						<FocusCaptureGroup focusable={showPin} autoFocus={false}>
							<ProfilePinPrompt
								name={name}
								onPinFocus={this.onPinInteract}
								onPinKeyDown={this.onPinInteract}
								onPinChange={this.onPinChange}
								pin={pin}
								onSubmit={this.onPinSubmit}
								onCancel={this.onPinCancel}
								error={error}
								showPin={showPin}
								loading={loading}
							/>
						</FocusCaptureGroup>
					</section>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	const { clientSide } = state.app;
	return {
		account: clientSide && state.account.info,
		enabled:
			clientSide && !state.session.profileSelected && state.account.info && state.account.info.profiles.length > 1,
		currentAppTheme: state.app.theme
	};
}

const actions = {
	switchProfile: SessionActions.switchProfile,
	setAppTheme: AppActions.setAppTheme
};

export default connect<any, any, ProfileSelectorProps>(
	mapStateToProps,
	actions
)(ProfileSelector);
