import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { FormattedTime } from 'react-intl';
import Spinner from 'ref/responsive/component/Spinner';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import Picture from 'shared/component/Picture';
import { getChannelLogoForThumbnailOverlay, imageExists } from 'shared/util/images';
import LiveProgress from '../../../component/LiveProgress';
import {
	ChannelScheduleEntityProps,
	ChannelScheduleProps,
	withChannelSchedule
} from '../../../component/ChannelSchedule';
import { resolveChannelLogo, resolveItemImage } from '../../../util/epg';
import { get } from 'shared/util/objects';
import { OpenModal, CloseModal, ToggleContent } from 'shared/uiLayer/uiLayerWorkflow';
import {
	getUserActionRequirement,
	redirectToSignPage,
	redirectToSubscriptions,
	USER_REQUIREMENT
} from '../../subscription/subscriptionsUtils';
import {
	subscriptionRequiredModal,
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	SubscriptionsModalProps
} from '../../../util/subscriptionUtil';
import { isSignedIn } from 'shared/account/accountUtil';
import { wrapLinear, wrapWatchCta } from 'shared/analytics/components/ItemWrapper';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';
import { canPlay } from 'toggle/responsive/pageEntry/util/offer';
import { goToChannel, onPlayerSignUp, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import {
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import { fullscreenService } from 'shared/uiLayer/fullScreenWorkflow';
import { isEdgeSpartan } from 'shared/util/browser';
import Badge from 'toggle/responsive/component/Badge';
import { getSignInRequiredModalForAnonymous } from 'toggle/responsive/player/playerModals';

import './EpgItemImage.scss';

const bem = new Bem('epg-image');

interface StateProps {
	config: api.AppConfig;
	account: state.Account;
	currentPath: string;
	useAmPmTimeFormat: boolean;
}

interface DispatchProps {
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	showContent: () => void;
	hideContent: () => void;
}

type Props = ChannelScheduleEntityProps & ChannelScheduleProps & StateProps & DispatchProps;

class EpgItemImage extends React.PureComponent<Props> {
	static contextTypes: any = {
		entry: PropTypes.object.isRequired
	};

	retrievedItem = false;

	context: { entry: PageEntryPropsBase };

	getItemWithCache = getItemWithCacheCreator();

	render() {
		const { loading, currentProgram, schedules } = this.props;
		const className = cx(bem.b({ loading, empty: !schedules.length }), this.props.className);
		const title = get(currentProgram, 'item.title') || '';

		return (
			<div className={className}>
				<div onClick={this.onItemClick}> {this.renderContent(title)}</div>
			</div>
		);
	}

	renderContent(title) {
		const { item, currentProgram } = this.props;
		const secondaryLanguageTitle = get(currentProgram, 'item.secondaryLanguageTitle') || '';
		const isErrorState = (!_SSR_ && !currentProgram) || (currentProgram && currentProgram.isGap);
		const itemImages = currentProgram && resolveItemImage(currentProgram.item);
		const channelLogo = resolveChannelLogo(item);
		const hasItemImage = itemImages && itemImages.length;
		const hasChannelLogo = channelLogo && imageExists(channelLogo);
		const shouldRenderChannelLogo = item && item.images && Object.keys(item.images).length;
		const hasPremiumIcon = item && item.badge;

		let picStyles: { backgroundImage: string };
		if (!hasItemImage) {
			picStyles = {
				backgroundImage: `url("${channelLogo}")`
			};
		}

		return (
			<div>
				<div style={picStyles} className={bem.e('pic', { 'no-programme': isErrorState || !hasItemImage })}>
					{!hasItemImage && !hasChannelLogo && this.renderChannelName()}
					{this.renderPicture()}
					{!isErrorState && shouldRenderChannelLogo && this.renderChannelLogo()}
					{!isErrorState && hasPremiumIcon && this.renderBadge()}
					{!isErrorState && this.renderProgress()}
				</div>
				{!isErrorState && title && (
					<div
						className={cx(
							bem.e('title', { 'text-clip': !secondaryLanguageTitle }),
							secondaryLanguageTitle ? 'truncate' : ''
						)}
					>
						{title}
					</div>
				)}
				{!isErrorState && secondaryLanguageTitle && (
					<div className={cx(bem.e('title'), 'truncate')}>{secondaryLanguageTitle}</div>
				)}
				{!isErrorState && this.renderTime()}

				{isErrorState && (
					<IntlFormatter tagName="div" className={cx(bem.e('title', { 'no-programme': isErrorState }))}>
						{currentProgram
							? currentProgram.isGap && currentProgram.item.description
							: '@{xchd1_no_metadata_error|We are currently experiencing a network issue. Please try again later.}'}
					</IntlFormatter>
				)}
			</div>
		);
	}

	onItemClick = () => {
		const showContent = () => {
			this.props.showContent();
			fullscreenService.removeCallback(showContent);
		};

		this.getUpdatedItem().then(item => {
			if (this.isPaidContent(item)) {
				if (isEdgeSpartan()) {
					this.onItemClickFullscreenCallback(item);
				} else {
					this.openSubscriptionRequiredModal(item);
				}
			} else {
				if (isEdgeSpartan()) {
					this.props.hideContent();
					const contentEl = document.querySelector('.content');
					fullscreenService.setFullScreenElement(contentEl);
					fullscreenService.switchOnFullscreen();
				}
				goToChannel(item, this.props.currentPath);
			}
		});
	};

	onItemClickFullscreenCallback = (item: api.ItemSummary) => {
		let timeout = 2000;

		if (this.retrievedItem) timeout = 0;

		const showSubscriptionRequiredModalTimeout = () => {
			setTimeout(() => {
				this.retrievedItem = true;
				this.openSubscriptionRequiredModal(item);
			}, timeout);
			fullscreenService.removeCallback(showSubscriptionRequiredModalTimeout);
		};

		fullscreenService.setCallback(showSubscriptionRequiredModalTimeout);
		fullscreenService.forceSwitchOffFullscreen();
	};

	async getUpdatedItem() {
		const id = get(this.props, 'item.id');
		if (!id) return;

		return await this.getItemWithCache(id);
	}

	private showUpsellModal = () => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(),
			onSignIn: () => this.onSignIn()
		};
		this.props.openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = (item: api.ItemDetail) => {
		const { openModal, account } = this.props;
		const isSignedInUser = isSignedIn(account);
		const upsellModalProps: UpsellModalProps = isSignedInUser
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn()
			  };
		const provider = get(item, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	isPaidContent(item) {
		return !canPlay(item);
	}

	openSubscriptionRequiredModal = item => {
		const { openModal, account, showContent } = this.props;
		const isSignedInUser = isSignedIn(account);

		showContent();

		const nextAction = getUserActionRequirement(isSignedInUser, item);
		if (nextAction === USER_REQUIREMENT.UPSELL) {
			return isContentProviderCeased(item) ? this.showCessationUpsellModal(item) : this.showUpsellModal();
		} else if (nextAction === USER_REQUIREMENT.SIGNIN_REQUIRED) {
			return openModal(getSignInRequiredModalForAnonymous(this.onSignIn, () => onPlayerSignUp(item && item.path)));
		}

		const props: SubscriptionsModalProps = {
			onConfirm: this.onConfirmModal,
			target: 'app',
			isSignedInUser
		};

		isContentProviderCeased(item) ? this.showCessationUpsellModal(item) : openModal(subscriptionRequiredModal(props));
	};

	onConfirmModal = () => {
		const { closeModal, account } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (isSignedIn(account)) {
			return this.onSubscribe();
		}
		return this.onSignIn();
	};

	onSignIn = () => {
		const { config, item } = this.props;
		redirectToSignPage(config, item.path);
	};

	onSubscribe = () => {
		const { config } = this.props;
		this.getUpdatedItem().then(updatedItem => {
			redirectToSubscriptions(updatedItem, config);
		});
	};

	onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	renderChannelLogo() {
		const { currentProgram, item } = this.props;
		if (!currentProgram) return;

		const channelLogo = getChannelLogoForThumbnailOverlay(item);

		return (
			<div className={bem.e('channel-logo')} onClick={this.onClick}>
				{imageExists(channelLogo) && <img src={channelLogo} className={bem.e('channel-logo-img')} alt={item.title} />}
			</div>
		);
	}

	onClick = e => {
		e.preventDefault();
	};

	renderBadge() {
		const { item } = this.props;
		return item.badge && <Badge item={item} className={bem.e('badge')} mod="packshot" />;
	}

	renderChannelName() {
		const { item } = this.props;
		return (
			<div className={bem.e('channel-name-container')}>
				<span className={bem.e('channel-name')}>{item.title}</span>
			</div>
		);
	}

	private renderPicture() {
		// tslint:disable-next-line:no-null-keyword
		if (_SSR_) return null;
		const { currentProgram, loading } = this.props;

		if (loading) {
			return <Spinner className={bem.e('spinner')} />;
		} else if (currentProgram) {
			const itemImage = resolveItemImage(currentProgram.item);
			if (itemImage && itemImage[0]) {
				return (
					<Picture
						src={itemImage[0].src}
						sources={itemImage}
						className={bem.e('item-pic')}
						imageClassName={bem.e('item-img')}
					/>
				);
			}
		}
	}

	renderProgress() {
		const { currentProgram, item } = this.props;
		const { customFields } = item;

		if (currentProgram) {
			return (
				<LiveProgress
					key={currentProgram.id}
					from={currentProgram.startDate}
					to={currentProgram.endDate}
					barColour={customFields && customFields.channelHexColour}
				/>
			);
		}
	}

	renderTime() {
		const { currentProgram, useAmPmTimeFormat } = this.props;
		if (currentProgram) {
			return (
				<div className={bem.e('time')} key={currentProgram.startDate.toString()}>
					<FormattedTime hour12={useAmPmTimeFormat} value={currentProgram.startDate} />
					{' - '}
					<FormattedTime hour12={useAmPmTimeFormat} value={currentProgram.endDate} />
				</div>
			);
		}
	}
}

function mapStateToProps({ app, account, page }: state.Root): StateProps {
	const useAmPmTimeFormat = get(app, 'config.linear.useAmPmTimeFormat');
	return {
		config: app.config,
		account,
		currentPath: page.history.location.pathname,
		useAmPmTimeFormat
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		showContent: () => dispatch(ToggleContent(true)),
		hideContent: () => dispatch(ToggleContent(false))
	};
}

export default connect<{}, DispatchProps, ChannelScheduleEntityProps & ChannelScheduleProps>(
	mapStateToProps,
	mapDispatchToProps
)(withChannelSchedule<{}>()(wrapWatchCta(wrapLinear(EpgItemImage))) as any);
