import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import PackshotList from 'ref/responsive/component/PackshotList';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { ShowPassiveNotification } from 'shared/uiLayer/uiLayerWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { onPlayerSignUp } from 'toggle/responsive/util/playerUtil';
import { getProfile, followItem, unfollowItem } from 'shared/service/action/profile';

import {
	getSignInRequiredModalForFavouriteTeamAnonymous,
	REQUIRE_MODAL_ID
} from 'toggle/responsive/player/playerModals';
import { getItem, setItem, removeItem } from 'shared/util/localStorage';

interface OwnProps extends PageEntryListProps {
	// When true converts to S3
	doubleRow?: boolean;
}

interface StateProps {
	isSignedIn: boolean;
	config?: state.Config;
	followedList: object;
}

interface DispatchProps {
	followTeam: (itemId: string) => any;
	getProfile: () => any;
	unfollowTeam: (itemId: string) => any;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void, onClose?: () => void) => void;
	closeModal: (id: string) => void;
	openModal: typeof OpenModal;
}

type Props = OwnProps & StateProps & DispatchProps;

const columns = [{ phone: 8 }, { phablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];
const MAX_TEAMS_SELECTED = 5;
export const FAV_TEAM_SELECTED_ID = 'fav_team_selected_id';
export const SHOW_MSG_TEAM_ALREADY_SELECTED = 'show_msg_team_already_selected';

class FavouriteTeams extends React.Component<Props, any> {
	componentDidMount() {
		// required for post signin/signup flow
		const teamId = this.getTeamIdFromStorage();
		if (teamId) {
			this.updateFavTeamsList(teamId);
		}
	}

	onSignInClick = () => {
		browserHistory.push(`/${getSignInPath(this.props.config)}`);
	};

	private showSignInRequiredModal = () => {
		setItem(SHOW_MSG_TEAM_ALREADY_SELECTED, 'YES');
		const { getSignInRequiredModal } = this.props;
		getSignInRequiredModal(this.onSignInRequiredConfirm, () => onPlayerSignUp(), this.onClose);
	};

	private onSignInRequiredConfirm = () => {
		const { closeModal } = this.props;
		closeModal(REQUIRE_MODAL_ID);
		return this.onSignInClick();
	};

	onClose = () => {
		this.removeFromLocalStorage();
	};

	private removeFromLocalStorage() {
		const { list } = this.props;
		const storageId = this.getStorageId(list.id);
		if (getItem(storageId)) {
			removeItem(storageId);
		}
		if (getItem(SHOW_MSG_TEAM_ALREADY_SELECTED)) {
			removeItem(SHOW_MSG_TEAM_ALREADY_SELECTED);
		}
	}

	private getCountryName(id) {
		const { list } = this.props;
		const country = list.items.find(country => country.id === id);
		if (country) return country.title;
		return '';
	}

	private updateFavTeamsList(teamId) {
		const { followedList, getProfile, isSignedIn, showPassiveNotification, unfollowTeam, followTeam } = this.props;

		if (!isSignedIn) return;

		const countryName = this.getCountryName(teamId);

		if (followedList.hasOwnProperty(teamId)) {
			// Post signin/signup check for already selected fav team
			if (getItem(SHOW_MSG_TEAM_ALREADY_SELECTED) === 'YES') {
				showPassiveNotification({
					content: <IntlFormatter>{'@{account_favourite_team_toastMessage_team_has_already_selected}'}</IntlFormatter>
				});
				this.removeFromLocalStorage();
				return;
			} else {
				// Remove team from list if already selected
				unfollowTeam(teamId)
					.then(response => {
						if (response.meta.res.status === 204) {
							getProfile();
							showPassiveNotification({
								content: (
									<IntlFormatter values={{ countryName: countryName ? countryName : 'Team' }}>
										{'@{account_favourite_team_toastMessage_remove_to_list}'}
									</IntlFormatter>
								)
							});
							this.removeFromLocalStorage();
						}
					})
					.catch(response => {
						if (_DEV_) console.log(response);
					});
			}
		} else {
			// Add Team to follow list if possible
			if (Object.keys(followedList).length < MAX_TEAMS_SELECTED) {
				followTeam(teamId).then(response => {
					getProfile();
					showPassiveNotification({
						content: (
							<IntlFormatter values={{ countryName: countryName ? countryName : 'Team' }}>
								{'@{account_favourite_team_toastMessage_added_to_list}'}
							</IntlFormatter>
						)
					});
					this.removeFromLocalStorage();
				});
			} else {
				// Display error message if max team limit has been reached
				this.removeFromLocalStorage();
				showPassiveNotification({
					content: <IntlFormatter>{'@{account_favourite_team_toastMessage_reached_maximum_limit}'}</IntlFormatter>
				});
			}
		}
	}

	private onFavButtonClick = (listId, teamId) => {
		// store to localstorage
		setItem(this.getStorageId(listId), teamId);
		const { isSignedIn } = this.props;
		if (!isSignedIn) {
			this.showSignInRequiredModal();
		} else {
			this.updateFavTeamsList(teamId);
		}
	};

	private getStorageId = listId => `${FAV_TEAM_SELECTED_ID}_${listId}`;

	private getTeamIdFromStorage = () => {
		const { list } = this.props;
		return getItem(this.getStorageId(list.id));
	};

	render() {
		const { list, customFields, savedState, doubleRow, loadNextListPage } = this.props;

		return (
			<PackshotList
				list={list}
				imageType={'square'}
				onPackshotClicked={item => this.onFavButtonClick(list.id, item.id)}
				packshotTitlePosition={customFields ? customFields.assetTitlePosition : undefined}
				savedState={savedState}
				columns={columns}
				doubleRow={doubleRow}
				loadNextListPage={loadNextListPage}
			/>
		);
	}
}

function mapStateToProps(state: state.Root, ownProps): StateProps {
	const { account } = state;
	const followedList = state.profile.info ? state.profile.info.followed : {};

	return {
		isSignedIn: !!account && account.active,
		config: state.app.config,
		followedList: followedList
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getProfile: () => dispatch(getProfile()),
		followTeam: (itemId: string) => dispatch(followItem(itemId)),
		unfollowTeam: (itemId: string) => dispatch(unfollowItem(itemId)),
		showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
			dispatch(ShowPassiveNotification(config)),
		getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void, onClose?: () => void) => {
			dispatch(OpenModal(getSignInRequiredModalForFavouriteTeamAnonymous(onSignIn, onSIgnUp, onClose)));
		},
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

const Component: any = connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(FavouriteTeams);

export default withRouter(Component);
