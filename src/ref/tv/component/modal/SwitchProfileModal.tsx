import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import Profile from 'ref/tv/pageEntry/account/a/Profile';
import PinInput from 'ref/tv/component/PinInput';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { connect } from 'react-redux';
import { switchProfile, cancelPrompt, signOut } from 'shared/account/sessionWorkflow';
import { GET_ACCOUNT_TOKEN, GET_PROFILE_TOKEN } from 'shared/service/action/authorization';
import { FormattedMessage } from 'react-intl';
import { maxProfile } from 'ref/tv/pageEntry/account/a/A4Profiles';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { getAccountToken } from 'shared/service/authorization';
import { requestToken } from 'shared/account/sessionWorkflow';
import { getDeviceId } from 'shared/util/deviceUtil';

import './SwitchProfileModal.scss';

export type SwitchProfileMode = 'selectProfile' | 'checkPin';
const itemsPerRow = 5;
const bem = new Bem('switch-profile-modal');
const useOSK = DeviceModel.hasOSK();

type SwitchProfileModalProps = Partial<{
	isInSigninProcess: boolean;
	account: state.Account;
	switchProfile: (targetProfile: api.ProfileSummary, pin?: string, isInSigninProcess?: boolean) => void;
	signOut: () => void;
	cancel: () => void;
	isParentalLock: boolean;
	close: (isSuc: boolean) => void;
	startMode: SwitchProfileMode;
	pinInputDone: (profileId?: string) => void;
	requestToken: (scopes: TokenScope[], pin: string, tokenType: TokenType) => any;
	profileId: string;
	editProfile: boolean;
}>;

type SwitchProfileStateProps = {
	prompt: AuthPrompt;
	curProfileId: string;
	error: Action<any>[];
	accountPlaybackToken: api.AccessToken;
};

interface SwitchProfileModalState {
	selectedIndex: number;
	pin: number[];
	pinMsg?: string;
	profiles: api.ProfileSummary[];
	curMode: SwitchProfileMode;
}

class SwitchProfileModal extends React.Component<
	SwitchProfileModalProps & SwitchProfileStateProps,
	SwitchProfileModalState
> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;
	private pinInput: PinInput;

	constructor(props: SwitchProfileModalProps & SwitchProfileStateProps) {
		super(props);

		this.state = {
			selectedIndex: 0,
			curMode: props.startMode || props.isParentalLock ? 'checkPin' : 'selectProfile',
			pin: [],
			profiles: props.account.info.profiles.slice(0, maxProfile)
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	componentWillReceiveProps(nextProps: SwitchProfileModalProps & SwitchProfileStateProps) {
		if (nextProps.prompt) {
			const prompt = nextProps.prompt;
			let pinMsg = '';
			if (prompt) {
				if (prompt.type === 'choose_profile') {
					if (prompt.error) {
						pinMsg = prompt.error;
					} else {
						this.props.cancel();
						this.context.focusNav.hideDialog();
					}
				} else if (prompt.type === 'signin_suc') {
					this.context.focusNav.hideDialog();
				}
			}

			this.setState({ pinMsg, pin: [] });
			return;
		}

		let error;
		if (nextProps.error) {
			const errors = this.getErroredQueries(nextProps.error);
			error = errors[nextProps.error.length - 1];
			if (error) {
				this.setState({ pinMsg: error, pin: [] });
			} else {
				this.setState({ pinMsg: '' });
			}
		}

		if (
			this.props.isParentalLock &&
			nextProps.accountPlaybackToken &&
			nextProps.accountPlaybackToken !== this.props.accountPlaybackToken
		) {
			this.context.focusNav.hideDialog();
			this.props.close && this.props.close(true);
		}

		if (!nextProps.prompt && !error) {
			this.context.focusNav.hideDialog();
			this.props.close && this.props.close(true);
		}
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveLeft = (): boolean => {
		const { curMode } = this.state;

		switch (curMode) {
			case 'selectProfile':
				// move focus through the profiles
				let selectedIndex = this.state.selectedIndex;
				if (selectedIndex > 0) {
					selectedIndex--;
					this.setState({
						selectedIndex
					});
				}
				break;
			case 'checkPin':
				this.pinInput && this.pinInput.handleInput('del');
				break;
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { curMode } = this.state;

		switch (curMode) {
			case 'selectProfile':
				// move focus through the profiles
				let selectedIndex = this.state.selectedIndex;
				if (selectedIndex < this.state.profiles.length - 1) {
					selectedIndex++;

					this.setState({
						selectedIndex
					});
				}
				break;
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { curMode } = this.state;

		switch (curMode) {
			case 'selectProfile':
				// move focus through the profiles, to the row up
				let selectedIndex = this.state.selectedIndex;
				const curLine = Math.floor(selectedIndex / itemsPerRow);

				if (curLine > 0) {
					selectedIndex -= itemsPerRow;
				}

				if (selectedIndex !== this.state.selectedIndex) {
					this.setState({
						selectedIndex
					});
				}
				break;
		}

		return true;
	};

	private moveDown = (): boolean => {
		const { curMode } = this.state;

		switch (curMode) {
			case 'selectProfile':
				// move focus through the profiles, to the row below
				const profileCount = this.state.profiles.length;
				let selectedIndex = this.state.selectedIndex;
				const maxLine = Math.floor(profileCount / itemsPerRow);
				const curLine = Math.floor(selectedIndex / itemsPerRow);

				if (curLine < maxLine) {
					selectedIndex += itemsPerRow;
				}

				if (selectedIndex >= profileCount) {
					selectedIndex = profileCount - 1;
				}

				if (selectedIndex !== this.state.selectedIndex) {
					this.setState({
						selectedIndex
					});
				}
				break;
		}

		return true;
	};

	private exec = (act?: string): boolean => {
		const { isParentalLock, curProfileId, startMode, isInSigninProcess, close, signOut } = this.props;
		const { curMode, profiles, selectedIndex } = this.state;

		switch (act) {
			case 'click':
				if (curMode === 'selectProfile') {
					const selectedProfileId = profiles[selectedIndex].id;
					if (selectedProfileId !== curProfileId) {
						this.switchProfile(profiles[selectedIndex]);
					} else {
						// tbd: should I show something to let the user know that the same profile has been selected?
						this.context.focusNav.hideDialog();
					}
				} else if (curMode === 'checkPin') {
					this.pinInput && this.pinInput.handleInput('click');
				}
				break;

			case 'del':
				if (curMode === 'checkPin') this.pinInput && this.pinInput.handleInput('del');
				break;

			case 'esc':
				return this.onEsc(isParentalLock, isInSigninProcess, curMode, startMode, close, signOut);

			default:
				if (curMode === 'checkPin') this.pinInput && this.pinInput.handleInput(act);
				break;
		}

		return true;
	};

	private onEsc = (isParentalLock, isInSigninProcess, curMode, startMode, close, signOut) => {
		if (isParentalLock) {
			this.context.focusNav.hideDialog();
			close && close(false);

			if (this.props.editProfile) {
				return true;
			}

			return;
		}

		if (curMode === 'checkPin' && startMode !== 'checkPin') {
			this.setState({ curMode: 'selectProfile', pin: [], pinMsg: undefined });
		} else {
			if (isInSigninProcess) {
				signOut();
			}

			this.context.focusNav.hideDialog();
			close && close(false);
		}

		return true;
	};

	private switchProfile(profile) {
		if (profile.pinEnabled) {
			this.setState({ curMode: 'checkPin' });
		} else {
			this.props.switchProfile(profile, undefined, this.props.isInSigninProcess);
			this.context.focusNav.hideDialog();
		}
	}

	private onPinInputDone = (pin: string) => {
		const {
			account,
			isInSigninProcess,
			isParentalLock,
			switchProfile,
			pinInputDone,
			prompt,
			requestToken,
			profileId,
			editProfile
		} = this.props;

		this.setState({
			pinMsg: undefined
		});

		if (isParentalLock && !editProfile) {
			requestToken(prompt.body, pin, prompt.tokenType).then(response => {
				if (response.error) {
					this.setState({ pinMsg: 'true' });
					return;
				}

				this.context.focusNav.hideDialog();
				pinInputDone && pinInputDone();

				return prompt.resolve && prompt.resolve(response.payload);
			});
		} else {
			getAccountToken({
				email: account.info.email,
				scopes: ['Playback'],
				password: pin,
				deviceId: getDeviceId()
			}).then(response => {
				if (response && !response.error) {
					const profile = this.state.profiles[this.state.selectedIndex];
					this.context.focusNav.hideDialog();

					if (editProfile) {
						pinInputDone && pinInputDone(profileId);
					} else {
						switchProfile(profile, pin, isInSigninProcess);
					}
				} else {
					this.setState({ pinMsg: 'true' });
				}
			});
		}
	};

	private onPinInputCancel = () => {
		const { isParentalLock, startMode, isInSigninProcess, close, signOut } = this.props;
		const { curMode } = this.state;

		return this.onEsc(isParentalLock, isInSigninProcess, curMode, startMode, close, signOut);
	};

	private getErroredQueries(erroredActions: Action<any>[]): string[] {
		return erroredActions.reduce((erroredQueries: string[], action: Action<any>) => {
			if (action.type === GET_ACCOUNT_TOKEN || action.type === GET_PROFILE_TOKEN) {
				erroredQueries.push(action.error as any);
			}
			return erroredQueries;
		}, []);
	}

	private profileMouseEnter = index => {
		this.setState({ selectedIndex: index });
	};

	private profileMouseClick = () => {
		this.exec('click');
	};

	render() {
		const { selectedIndex, curMode, profiles, pinMsg } = this.state;
		const { isParentalLock, editProfile } = this.props;
		const showPin = curMode === 'checkPin';

		return (
			<div className={bem.b()}>
				<div className={bem.e('logo')} />
				<div className={bem.e('content')}>
					<FormattedMessage id="switch_profile_title">
						{value => <div className={bem.e('title')}>{value}</div>}
					</FormattedMessage>
					<div className={bem.e('profiles')}>
						{profiles.map((profile, index) => (
							<Profile
								key={`${profile.id}-${index}`}
								profile={profile}
								focused={selectedIndex === index}
								index={index}
								mouseEnter={this.profileMouseEnter}
								mouseClick={this.profileMouseClick}
							/>
						))}
					</div>
				</div>
				{showPin && (
					<PinInput
						ref={ref => (this.pinInput = ref)}
						mode={isParentalLock && !editProfile ? 'check_play' : 'check_profile'}
						className={bem.e('pin')}
						useOSK={useOSK}
						pinMsg={pinMsg}
						onDone={this.onPinInputDone}
						onCancel={this.onPinInputCancel}
					/>
				)}
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): SwitchProfileStateProps {
	const authPrompts = state.session.authPrompts;
	let accountPlaybackToken;
	let token;

	if (state.session.tokens) {
		for (let i = 0; i < state.session.tokens.length; i++) {
			token = state.session.tokens[i];
			if (token.scope === 'Playback' && token.type === 'UserAccount') {
				accountPlaybackToken = token;
			}
		}
	}

	return {
		prompt: authPrompts && authPrompts.length > 0 ? authPrompts[0] : undefined,
		curProfileId: state.profile && state.profile.info && state.profile.info.id,
		error: state.app.erroredActions,
		accountPlaybackToken
	};
}

function mapDispatchToProps(dispatch: any): SwitchProfileModalProps {
	return {
		switchProfile: (profile, pin, isInSigninProcess) => dispatch(switchProfile(profile, pin, isInSigninProcess)),
		cancel: () => dispatch(cancelPrompt()),
		signOut: () => dispatch(signOut()),
		requestToken: (scopes: TokenScope[], pin: string, tokenType: TokenType) =>
			dispatch(requestToken(scopes, undefined, pin, tokenType || 'UserProfile'))
	};
}

export default connect<SwitchProfileStateProps, SwitchProfileModalProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(SwitchProfileModal);
