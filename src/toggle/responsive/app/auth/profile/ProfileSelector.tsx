import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import { browserHistory } from 'shared/util/browserHistory';
import { Bem } from 'shared/util/styles';
import * as AppActions from 'shared/app/appWorkflow';
import * as SessionActions from 'shared/account/sessionWorkflow';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Home, Account } from 'shared/page/pageKey';
import { MIN_SECURE_STRING_LENGTH } from 'toggle/responsive/pageEntry/account/accountUtils';
import { errorMap } from 'toggle/responsive/util/profileUtil';
import { formDisplayState } from '../../../pageEntry/account/ssoValidationUtil';
import ProfilePinPrompt from './ProfilePinPrompt';
import Selector from './ProfilesPrompt';
import { getRegisteredProfileInfo } from 'shared/account/profileUtil';

import 'ref/responsive/app/auth/profile/ProfileSelector.scss';

const bem = new Bem('profile-selector');

interface ProfileSelectorProps extends React.Props<PageEntryPropsBase> {
	switchProfile?: (profile: api.ProfileSummary, pin?: string) => any;
	setAppTheme?: (theme: AppTheme) => void;
	account?: api.Account;
	enabled?: boolean;
	currentAppTheme?: AppTheme;
	homepageUrl?: string;
	accountUrl?: string;
	location?: HistoryLocation;
	profile?: api.ProfileDetail;
}

interface ProfileSelectorState {
	prevAppTheme?: AppTheme;
	pin: string;
	selectedProfile: api.ProfileSummary;
	error: string;
	showPin: boolean;
	loading: boolean;
	displayState: formDisplayState;
}

function setDefaultProfileWhenSingle(props: ProfileSelectorProps) {
	const { account } = props;
	if (account && account.profiles && account.profiles.length === 1) {
		// auto-select the first profile if it's the only one
		props.switchProfile(account.profiles[0]);
	}
}

const hid = 'profile-switcher-heading';

class ProfileSelector extends React.Component<ProfileSelectorProps, ProfileSelectorState> {
	private initState: ProfileSelectorState = {
		pin: '',
		selectedProfile: undefined,
		error: undefined,
		showPin: false,
		loading: false,
		displayState: formDisplayState.DEFAULT
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
		const profileTheme = nextProps.currentAppTheme === 'profiles';
		if (this.props.enabled !== nextProps.enabled) {
			const newState: ProfileSelectorState = this.initState;
			// Update App Theme
			if (nextProps.enabled) {
				// Store previous theme for later restoration
				if (!profileTheme) newState.prevAppTheme = nextProps.currentAppTheme;
				// Set theme to profiles while the user chooses their profile
				nextProps.setAppTheme('profiles');
			} else {
				// Restore the previous theme if returning to the same page, or sometimes a redirect occurs resulting in a
				// different page theme so we favour the new page's theme over the previous page's theme from stored state.
				const nextTheme = !profileTheme ? nextProps.currentAppTheme : this.state.prevAppTheme;
				this.props.setAppTheme(nextTheme);

				// scroll to top in case user scrolled down for profile selection
				ReactDOM.findDOMNode(this).scrollTop = 0;
			}
			// Update pending state
			this.setState(newState);
		}
		const { account, profile } = this.props;
		// Set profile whenever account or profile is ready
		if ((!account && nextProps.account) || (!(profile && Object.keys(profile).length) && nextProps.profile)) {
			setDefaultProfileWhenSingle(nextProps);
		}
	}

	private goToHomepage = () => {
		const { location, homepageUrl, accountUrl } = this.props;
		if (location.pathname.includes(accountUrl)) {
			browserHistory.push(homepageUrl);
		}
	};

	private onProfileSelect = (selectedProfile: api.ProfileSummary) => {
		const { account } = this.props;
		if (selectedProfile.isRestricted && account.pinEnabled) {
			this.setState({ selectedProfile, showPin: true });
			return;
		}
		this.switchProfile(selectedProfile);
	};

	private switchProfile(selectedProfile) {
		const pin = this.state.pin ? this.state.pin : undefined;
		this.setState({ loading: true, selectedProfile });
		this.goToHomepage();

		this.props
			.switchProfile(selectedProfile, pin)
			.then(() => {
				this.setState({ loading: false });
			})
			.catch((error: api.ServiceError) => {
				let state = {
					loading: false,
					error: undefined,
					displayState: formDisplayState.ERROR
				};
				if (errorMap[error.code]) state.error = errorMap[error.code];
				this.setState(state);
			});
	}

	private onPinChange = e => {
		const newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	};

	private onPinCancel = () => {
		this.setState({
			pin: '',
			error: undefined,
			showPin: false,
			loading: false,
			displayState: formDisplayState.DEFAULT
		});
	};

	private onPinFocus = () => {
		this.setState({
			error: undefined,
			displayState: formDisplayState.DEFAULT
		});
	};

	private onPinSubmit = e => {
		e.preventDefault();
		const pin = this.state.pin;
		this.setState({ displayState: formDisplayState.DEFAULT });
		if (!pin || pin.length < MIN_SECURE_STRING_LENGTH) {
			this.setState({ error: errorMap[5], displayState: formDisplayState.ERROR });
			return;
		}
		this.switchProfile(this.state.selectedProfile);
	};

	render() {
		const { enabled, account } = this.props;
		const { selectedProfile, error, loading, showPin, displayState } = this.state;

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
								loading={loading}
							/>
						</FocusCaptureGroup>
					</section>
				</div>
				<div className={bem.e('pin-prompt', { visible: showPin })}>
					<section className={bem.e('container')}>
						<FocusCaptureGroup focusable={showPin} autoFocus={false}>
							<ProfilePinPrompt
								showPin={showPin}
								onPinChange={this.onPinChange}
								onSubmit={this.onPinSubmit}
								onFocus={this.onPinFocus}
								onCancel={this.onPinCancel}
								error={error}
								loading={loading}
								displayState={displayState}
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
	const enabled =
		clientSide &&
		!state.session.profileSelected &&
		state.account.info &&
		state.account.info.profiles &&
		state.account.info.profiles.length > 1;
	return {
		account: clientSide && state.account.info,
		homepageUrl: getPathByKey(Home, state.app.config),
		accountUrl: getPathByKey(Account, state.app.config),
		location: state.page.history.location,
		profile: getRegisteredProfileInfo(state.profile),
		enabled,
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
