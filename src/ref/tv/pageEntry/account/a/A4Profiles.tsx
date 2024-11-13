import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Profile from 'ref/tv/pageEntry/account/a/Profile';
import { Bem } from 'shared/util/styles';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { wrapValue } from 'ref/tv/util/focusUtil';
import { promptStartEditProfile, promptNewProfile } from 'shared/account/profileEditWorkflow';
import EntryTitle from 'ref/tv/component/EntryTitle';
import { setPaddingStyle } from 'ref/tv/util/rows';
import SwitchProfileModal from 'ref/tv/component/modal/SwitchProfileModal';
import { A4Profiles as template } from 'shared/page/pageEntryTemplate';
import sass from 'ref/tv/util/sass';
import './A4Profiles.scss';

const bem = new Bem('a4');
const itemsPerRow = 8;
export const maxProfile = 19; // Change from 20 to 19 because the last one is always 'Create New'

interface A4ProfilesProps extends PageEntryListProps {
	account?: state.Account;
}

interface A4ProfilesDispatcherProps {
	promptStartEditProfile: (profileId: string) => any;
	promptNewProfile: () => any;
}

interface A4ProfilesState {
	isFocused: boolean;
	selectedIndex: number;
	profiles: api.ProfileSummary[];
	lockInfo: boolean[];
}

class A4ProfilesClass extends React.Component<A4ProfilesProps & A4ProfilesDispatcherProps, A4ProfilesState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private activeProfile?: api.ProfileSummary;

	constructor(props) {
		super(props);

		const profiles = props.account.info.profiles.slice(0, maxProfile);
		const a4Height = Math.ceil((profiles.length + 1) / itemsPerRow) * sass.a4ProfilesTotalHeight;

		this.state = {
			selectedIndex: 0,
			isFocused: false,
			profiles,
			lockInfo: this.getLockInfo(profiles)
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			height: props.title ? a4Height + sass.assetListTitleHeight + sass.assetListTitleMarginBottom : a4Height,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};

		this.activeProfile = this.props.activeProfile;
	}

	componentDidMount() {
		this.context.focusNav.registerRow(this.focusableRow);

		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentWillReceiveProps(nextProps: A4ProfilesProps) {
		if (nextProps.activeProfile) {
			if (
				this.activeProfile !== nextProps.activeProfile ||
				(this.activeProfile && this.activeProfile.pinEnabled !== nextProps.activeProfile.pinEnabled)
			) {
				this.activeProfile = nextProps.activeProfile;
			}
		}

		if (nextProps.account && nextProps.account.info && nextProps.account.info.profiles) {
			const profiles = nextProps.account.info.profiles.slice(0, maxProfile);
			const a4Height = Math.ceil((profiles.length + 1) / itemsPerRow) * sass.a4ProfilesTotalHeight;
			const rowHeight = nextProps.title
				? a4Height + sass.assetListTitleHeight + sass.assetListTitleMarginBottom
				: a4Height;
			this.focusableRow.height = rowHeight;
			this.setState({
				profiles,
				lockInfo: this.getLockInfo(profiles)
			});
		}

		this.focusableRow.entryProps = nextProps;
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as A4ProfilesState;
		if (state) {
			this.setState({
				isFocused: state.isFocused,
				selectedIndex: state.selectedIndex,
				profiles: state.profiles
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private moveLeft = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex - 1, 0, this.state.profiles.length));
		return true;
	};

	private moveRight = (): boolean => {
		this.changeFocus(wrapValue(this.state.selectedIndex + 1, 0, this.state.profiles.length));
		return true;
	};

	private moveUp = (): boolean => {
		let selectedIndex = this.state.selectedIndex;
		const curLine = Math.floor(selectedIndex / itemsPerRow);

		if (curLine > 0) {
			selectedIndex -= itemsPerRow;
		} else {
			return false;
		}

		if (selectedIndex !== this.state.selectedIndex) {
			this.changeFocus(selectedIndex);
		}
		return true;
	};

	private moveDown = (): boolean => {
		const profileCount = this.state.profiles.length;
		const maxLine = Math.floor(profileCount / itemsPerRow);
		let selectedIndex = this.state.selectedIndex;

		const curLine = Math.floor(selectedIndex / itemsPerRow);
		if (curLine < maxLine) {
			selectedIndex += itemsPerRow;
		} else {
			return false;
		}

		if (selectedIndex > profileCount) {
			selectedIndex = profileCount; // there's a 'Create New' at end, so don't -1
		}

		if (selectedIndex !== this.state.selectedIndex) {
			this.changeFocus(selectedIndex);
		}

		return true;
	};

	private exec = (act?: string, index?: number): boolean => {
		switch (act) {
			case 'click':
				let { selectedIndex, profiles } = this.state;

				if (index !== undefined) {
					this.setState({ selectedIndex: index });
					selectedIndex = index;
				}

				if (selectedIndex < profiles.length) {
					// Edit profile
					if (profiles[selectedIndex].pinEnabled) {
						this.context.focusNav.showDialog(
							<SwitchProfileModal
								account={this.props.account}
								isParentalLock={true}
								editProfile={true}
								pinInputDone={this.props.promptStartEditProfile}
								profileId={profiles[selectedIndex].id}
							/>
						);
					} else {
						this.props.promptStartEditProfile(profiles[selectedIndex].id);
					}
				} else {
					// Create new
					this.props.promptNewProfile();
				}

				return true;
			default:
				break;
		}

		return false;
	};

	private changeFocus = (index: number) => {
		this.setState({
			selectedIndex: index
		});
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private profileMouseEnter = index => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		this.changeFocus(index);
	};

	private profileMouseClick = (act: string, index: number) => {
		this.exec(act, index);
	};

	private getLockInfo(profiles) {
		let lockInfo = [];
		let profile;
		for (let i = 0; i < profiles.length; i++) {
			profile = profiles[i];
			lockInfo.push(profile.pinEnabled);
		}

		return lockInfo;
	}

	render() {
		const { selectedIndex, isFocused, lockInfo } = this.state;
		const profileCount = this.state.profiles.length;
		return (
			<div
				className={bem.b({ focused: this.state.isFocused })}
				ref={ref => (this.ref = ref)}
				style={{ height: `${this.focusableRow.height}px` }}
			>
				<EntryTitle {...this.props} />
				<div className={bem.e('profiles')}>
					{this.props.account.info &&
						this.state.profiles.map((profile, index) => (
							<Profile
								key={`${profile.id}-${index}`}
								profile={profile}
								focused={isFocused && selectedIndex === index}
								locked={lockInfo[index]}
								index={index}
								mouseEnter={this.profileMouseEnter}
								mouseLeave={this.handleMouseLeave}
								mouseClick={this.profileMouseClick}
							/>
						))}
					{
						<Profile
							key={'create-new'}
							profile={undefined}
							focused={isFocused && selectedIndex === profileCount}
							index={profileCount}
							mouseEnter={this.profileMouseEnter}
							mouseLeave={this.handleMouseLeave}
							mouseClick={this.profileMouseClick}
						/>
					}
				</div>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch: any): A4ProfilesDispatcherProps {
	return {
		promptStartEditProfile: (profileId: string) => dispatch(promptStartEditProfile(profileId)),
		promptNewProfile: () => dispatch(promptNewProfile())
	};
}

const A4Profiles = connect<A4ProfilesProps, A4ProfilesDispatcherProps, A4ProfilesProps>(
	undefined,
	mapDispatchToProps
)(A4ProfilesClass);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(A4Profiles as any).template = template;
export default A4Profiles;
