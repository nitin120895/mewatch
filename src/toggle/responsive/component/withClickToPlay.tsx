import * as React from 'react';
import { connect } from 'react-redux';
import { XT1, isClickToPlayPageEntry } from 'shared/page/pageEntryTemplate';
import { isMovie, isXRowSubscriptionContent } from 'shared/util/itemUtils';
import { isLink, isSeason, isShow } from 'ref/responsive/util/item';
import {
	getAllowedToWatchAge,
	isAccountAgeValid,
	isItemRestricted,
	onPlayerSignIn,
	onPlayerSignUp,
	isMoviePath,
	FULLSCREEN_QUERY_PARAM,
	CLICK_TO_PLAY_QUERY_PARAM,
	isContentProviderCeased
} from '../util/playerUtil';
import {
	getRestrictedContentModal as getUnderAgeContentModal,
	getRestrictedModalForAnonymous,
	getSignInRequiredModalForAnonymous
} from '../player/playerModals';
import {
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	subscriptionRequiredModal,
	SubscriptionsModalProps,
	upsellModal,
	UpsellModalProps,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import { redirectToSignPage, redirectToSubscriptions } from '../pageEntry/subscription/subscriptionsUtils';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { isAnonymousUser } from 'shared/account/sessionWorkflow';
import {
	getClickToPlayWatchPath,
	getUpdatedItem,
	getWatchPathId,
	redirectToWatchPage
} from 'toggle/responsive/page/item/itemUtil';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import { isChannel } from 'toggle/responsive/util/epg';
import { isSubscriptionPage } from 'shared/page/pageUtil';
import { browserHistory } from 'shared/util/browserHistory';
import { get } from 'shared/util/objects';
import { setXT1ChainPlay } from 'shared/app/playerWorkflow';
import { isWatchPath } from 'shared/app/routeUtil';
import { addQueryParameterToURL } from 'shared/util/urls';

interface Props {
	template?: string;
	clickToPlay?: (item: api.ItemSummary, CTPParams: any) => void;
	getListKey?: () => number | string;
	chainPlay?: boolean;
}

interface DispatchProps {
	openModal?: (modal: ModalConfig) => void;
	closeModal?: (id: string) => void;
	setXT1ChainPlay?: (xt1ChainPlayList: number | string, chainPlayOrigin?: string) => void;
}

interface StateProps {
	config?: api.AppConfig;
	currentPath?: string;
	pageTemplate?: string;
	accountActive?: boolean;
	isAnonymous?: boolean;
}

export type ClickToPlayProps = Props & StateProps & DispatchProps;

export default function withClickToPlay<ComponentProps>() {
	return Component => {
		function mapDispatchToProps(dispatch: Redux.Dispatch<any>, ownProps: ComponentProps) {
			return {
				openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
				closeModal: (id: string) => dispatch(CloseModal(id)),
				setXT1ChainPlay: (xt1ChainPlayList: string | number, chainPlayOrigin?: string) =>
					dispatch(setXT1ChainPlay(xt1ChainPlayList, chainPlayOrigin))
			};
		}

		function mapStateToProps(store: state.Root, props: Props): any {
			const { account, app, page } = store;
			return {
				config: app.config,
				currentPath: page.history.location.pathname,
				pageTemplate: get(page, 'history.pageSummary.template'),
				accountActive: account.active,
				isAnonymous: isAnonymousUser(store)
			};
		}

		class ClickToPlay extends React.PureComponent<ComponentProps & ClickToPlayProps> {
			constructor(props) {
				super(props);
			}

			render() {
				return <Component {...this.props} clickToPlay={this.clickToPlay} />;
			}

			clickToPlay = (item: api.ItemSummary, CTPParams: any = {}) => {
				const { template, pageTemplate, getListKey, chainPlay, setXT1ChainPlay, currentPath } = this.props;
				const { isContinueWatching = false, path = item.path, defaultBehaviour } = CTPParams;
				const isShowOrSeason = isShow(item) || isSeason(item);
				const clickToPlayExclude = isMovie(item) || isShowOrSeason;
				const isClickToPlay = isClickToPlayPageEntry(template) && !clickToPlayExclude;

				if (isLink(item)) {
					// If Subscription page, retain query params in partner page links
					const redirectUrl = isSubscriptionPage(pageTemplate) ? `${item.path}${window.location.search}` : item.path;
					if (isWatchPath(redirectUrl)) {
						const itemId = getWatchPathId(redirectUrl);
						getUpdatedItem(itemId)
							.then(res => {
								const itemPath = isChannel(res) ? res.path : redirectUrl; // Check if item is a channel before redirection to channel path
								browserHistory.push(
									addQueryParameterToURL(itemPath, {
										redirect: true,
										[FULLSCREEN_QUERY_PARAM]: true,
										[CLICK_TO_PLAY_QUERY_PARAM]: true
									})
								);
							})
							.catch(e => {
								browserHistory.push('/404');
							});
					} else {
						browserHistory.push(redirectUrl);
					}
					return;
				}

				getUpdatedItem(item.id).then(item => {
					const itemRestricted = isItemRestricted(item);
					const isValidAge = itemRestricted ? isAccountAgeValid(item) : true;
					const canPlayItem = canPlay(item) && isValidAge;

					setXT1ChainPlay(template === XT1 && chainPlay ? getListKey() : undefined, currentPath);
					if (!canPlayItem && (isClickToPlay || isXRowSubscriptionContent(item, template))) {
						if (isRegistrationOnlyRequired(item) && itemRestricted) {
							this.getRestrictedContentModal(
								item,
								() => onPlayerSignIn(getClickToPlayWatchPath(item)),
								() => onPlayerSignUp(getClickToPlayWatchPath(item))
							);
						} else {
							this.openSubscriptionModal(item);
						}
						return;
					}

					if ((canPlayItem && !isShowOrSeason && isClickToPlay) || isContinueWatching) {
						const gotoWatchPath = isMoviePath(path) && isContinueWatching;
						redirectToWatchPage(item, isClickToPlay || isContinueWatching, gotoWatchPath);

						return;
					}

					if (defaultBehaviour) {
						defaultBehaviour();
					}
				});
			};

			private getRestrictedContentModal = (item: api.ItemSummary, onSignIn: () => void, onSIgnUp: () => void) => {
				const { isAnonymous, openModal } = this.props;
				if (isAnonymous) {
					openModal(getRestrictedModalForAnonymous(onSignIn, onSIgnUp));
				} else {
					openModal(getUnderAgeContentModal(undefined, getAllowedToWatchAge(item)));
				}
			};

			private openSubscriptionModal = item => {
				const { openModal, accountActive } = this.props;
				const watchPath = getClickToPlayWatchPath(item);

				if (isRegistrationOnlyRequired(item)) {
					openModal(
						getSignInRequiredModalForAnonymous(() => this.onSignIn(watchPath), () => onPlayerSignUp(watchPath))
					);
					return;
				} else {
					if (!accountActive) {
						return isContentProviderCeased(item) ? this.showCessationUpsellModal(item) : this.showUpsellModal(item);
					}
				}

				const props: SubscriptionsModalProps = {
					onConfirm: () => this.onConfirm(item),
					target: 'app',
					isSignedInUser: accountActive
				};

				isContentProviderCeased(item)
					? this.showCessationUpsellModal(item)
					: openModal(subscriptionRequiredModal(props));
			};

			private showUpsellModal = item => {
				const watchPath = getClickToPlayWatchPath(item);
				const upsellModalProps: UpsellModalProps = {
					onSubscribe: () => this.onSubscribe(item),
					onSignIn: () => this.onSignIn(watchPath)
				};
				this.props.openModal(upsellModal(upsellModalProps));
			};

			private showCessationUpsellModal = item => {
				const { openModal, isAnonymous } = this.props;
				const watchPath = getClickToPlayWatchPath(item);
				const upsellModalProps: UpsellModalProps = !isAnonymous
					? { onSubscribe: () => this.onCessationCancelClick() }
					: {
							onSubscribe: () => this.onCessationCancelClick(),
							onSignIn: () => this.onSignIn(watchPath)
					  };
				const provider = get(item, 'customFields.Provider');
				openModal(upsellCessationModal(upsellModalProps, provider));
			};

			private onSubscribe = item => {
				const { config } = this.props;
				redirectToSubscriptions(item, config);
			};

			private onCessationCancelClick = () => {
				const { closeModal } = this.props;
				closeModal(UPSELL_CESSATION_MODAL);
			};

			private onConfirm = item => {
				const { closeModal, accountActive } = this.props;
				closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

				if (accountActive) {
					return this.onSubscribe(item);
				}

				return this.onSignIn();
			};

			private onSignIn = (watchPath?: string) => {
				const { config, currentPath } = this.props;
				redirectToSignPage(config, watchPath || currentPath);
			};
		}

		return connect<ClickToPlayProps, any, any>(
			mapStateToProps,
			mapDispatchToProps
		)(ClickToPlay);
	};
}
