import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { FormattedTime } from 'react-intl';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { UPDATE_PLAYER_ENTRY_POINT } from 'shared/app/playerWorkflow';
import { Bem } from 'shared/util/styles';
import { fallbackURI } from 'shared/util/images';
import { browserHistory } from 'shared/util/browserHistory';
import Picture from 'shared/component/Picture';
import Spinner from 'ref/responsive/component/Spinner';
import Badge from 'toggle/responsive/component/Badge';
import LiveProgress from 'toggle/responsive/component/LiveProgress';
import {
	ChannelScheduleEntityProps,
	ChannelScheduleProps,
	withChannelSchedule
} from 'toggle/responsive/component/ChannelSchedule';
import { resolveChannelLogo, resolveItemImage, noCurrentProgram } from 'toggle/responsive/util/epg';
import { get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { isMobile } from 'shared/util/browser';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';
import { FULLSCREEN_QUERY_PARAM, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import {
	subscriptionRequiredModal,
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	SubscriptionsModalProps,
	cessationSubscriptionRequiredModal
} from 'toggle/responsive/util/subscriptionUtil';
import {
	redirectToSignPage,
	redirectToSubscriptions
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import {
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';
import { isSignedIn } from 'shared/account/accountUtil';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { canPlay, isRegistrationOnlyRequired } from 'toggle/responsive/pageEntry/util/offer';

import './OverlayChannelSelectorItem.scss';

const bem = new Bem('overlay-channel-selector-item');
const RECENT_PROGRAM_AMOUNT = 1;

interface OwnProps {
	item: api.ItemSummary;
	selected: boolean;
	onItemClick: (item: api.ItemSummary, element: HTMLElement) => void;
	onClose: () => void;
	account: state.Account;
	showModal: (modal: ModalConfig) => void;
	toggleOnNowOverlay: () => void;
	isMobileLandscape: boolean;
}

interface DispatchProps {
	openModal: (modal: ModalConfig) => void;
	closeModal: (id: string) => void;
	updateVideoEntryPoint: (entryPoint: VideoEntryPoint) => void;
}

interface StateProps {
	config: api.AppConfig;
}

type Props = OwnProps & ChannelScheduleEntityProps & ChannelScheduleProps & StateProps & DispatchProps;

class OverlayChannelSelectorItem extends React.PureComponent<Props> {
	itemRef: HTMLElement = undefined;
	getTitle = (item: api.ItemSchedule) => get(item, 'item.title') || get(item, 'item.secondaryLanguageTitle') || '';
	getItemWithCache = getItemWithCacheCreator();

	onRef = element => {
		if (!this.itemRef) {
			this.itemRef = element;
		}
	};

	onItemClick = () => {
		this.getUpdatedItem().then(item => {
			if (this.isPaidContent(item)) {
				this.openSubscriptionRequiredModal(item);
			} else {
				this.goToChannel(item);
				this.props.updateVideoEntryPoint(VideoEntryPoint.SwitchChannel);
			}
		});
	};

	openSubscriptionRequiredModal = item => {
		const { openModal, account } = this.props;
		const isSignedInUser = isSignedIn(account);

		if (!isSignedInUser && !isRegistrationOnlyRequired(item)) {
			isContentProviderCeased(item) ? this.showCessationUpsellModal(item) : this.showUpsellModal();
		} else if (isSignedInUser && isContentProviderCeased(item)) {
			const props: SubscriptionsModalProps = {
				onConfirm: this.onCessationCancelClick,
				target: 'linearPlayer',
				isSignedInUser
			};
			const provider = get(item, 'customFields.Provider');
			openModal(cessationSubscriptionRequiredModal(props, provider));
		} else {
			const props: SubscriptionsModalProps = {
				onConfirm: this.onConfirmModal,
				target: 'linearPlayer',
				isSignedInUser
			};
			openModal(subscriptionRequiredModal(props));
		}
	};

	onConfirmModal = () => {
		const { closeModal, account } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (isSignedIn(account)) {
			return this.onSubscribe();
		}
		return this.onSignIn();
	};

	onSubscribe = () => {
		const { config } = this.props;
		this.getUpdatedItem().then(updatedItem => {
			redirectToSubscriptions(updatedItem, config);
		});
	};
	private onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	onSignIn = () => {
		const { config, item } = this.props;
		redirectToSignPage(config, item.path);
	};

	private showUpsellModal = () => {
		const { openModal } = this.props;
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(),
			onSignIn: () => this.onSignIn(),
			modalTarget: 'linearPlayer'
		};
		openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = item => {
		const { openModal, account } = this.props;
		const isSignedInUser = isSignedIn(account);
		const upsellModalProps: UpsellModalProps = isSignedInUser
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn(),
					modalTarget: 'linearPlayer'
			  };

		const provider = get(item, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	isPaidContent(item) {
		return !canPlay(item);
	}

	goToChannel(item) {
		const { onItemClick } = this.props;
		onItemClick(item, this.itemRef);
		browserHistory.push(`${item.path}?${FULLSCREEN_QUERY_PARAM}`);
	}

	async getUpdatedItem() {
		const id = get(this.props, 'item.id');
		if (!id) return;

		return await this.getItemWithCache(id);
	}

	onChannelLogoClick = e => {
		e.stopPropagation();
		this.onItemClick();
	};

	render() {
		const { loading, item, currentProgram, schedules, selected, isMobileLandscape } = this.props;
		const currentProgramTitle = this.getTitle(currentProgram);
		const upcomingProgram = schedules[1];
		const upcomingProgramTitle = this.getTitle(upcomingProgram);

		const className = cx(
			bem.b({
				loading,
				empty: !schedules.length,
				selected,
				landscape: isMobileLandscape
			}),
			this.props.className
		);
		const noProgramPlaying = noCurrentProgram(currentProgram, schedules);
		const isErrorState = !currentProgram || (currentProgram && currentProgram.isGap) || noProgramPlaying;
		const itemImages = currentProgram && resolveItemImage(currentProgram.item);
		const channelLogo = resolveChannelLogo(item);
		const hasItemImage = itemImages && itemImages.length;
		const hasChannelLogo = channelLogo && channelLogo !== fallbackURI;
		const itemWithSchedule = { ...item, scheduleItem: currentProgram };
		let picStyles;
		if (!hasItemImage) {
			picStyles = {
				backgroundImage: `url("${channelLogo}")`
			};
		}

		return (
			<CTAWrapper type={CTATypes.Watch} data={{ item: itemWithSchedule, entryPoint: VideoEntryPoint.SwitchChannel }}>
				<div className={className} onClick={() => this.onItemClick()} ref={this.onRef}>
					<div className={bem.e('pic-wrapper')}>
						<div style={picStyles} className={bem.e('pic')} onClick={this.onChannelLogoClick}>
							{item.badge && <Badge item={item} className={bem.e('badge')} mod="packshot" />}
							{!hasChannelLogo && this.renderChannelName()}
							{this.renderPicture()}
							{!isErrorState && this.renderProgress()}
						</div>
					</div>

					<div className={bem.e('details')}>
						{!isErrorState && currentProgramTitle && <div className={bem.e('title')}>{currentProgramTitle}</div>}
						{!isErrorState && this.renderTime(currentProgram)}
						{!isErrorState && !isMobile() && !isMobileLandscape && upcomingProgram && (
							<div className={bem.e('upcoming')}>
								<IntlFormatter tagName="div" className={bem.e('next')}>
									{'@{xchd1_next|next}'}
								</IntlFormatter>
								{upcomingProgramTitle && <div className={bem.e('title')}>{upcomingProgramTitle}</div>}
								{this.renderTime(upcomingProgram)}
							</div>
						)}

						{isErrorState && (
							<IntlFormatter tagName="div" className={cx(bem.e('title', { 'no-programme': isErrorState }))}>
								{noProgramPlaying
									? '@{epg_noSchedule_description|There is currently no programme showing on this channel.}'
									: '@{xchd1_no_metadata_error|We are currently experiencing a network issue. Please try again later.}'}
							</IntlFormatter>
						)}

						{/* No Program currently showing */}
					</div>
				</div>
			</CTAWrapper>
		);
	}

	renderPicture() {
		const { item, currentProgram, loading } = this.props;

		if (loading) {
			return <Spinner className={bem.e('spinner')} />;
		} else if (currentProgram) {
			const itemImage = resolveItemImage(item);
			if (itemImage && itemImage[0] && itemImage[0].src) {
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

	renderChannelName() {
		const { item } = this.props;
		return <div className={cx(bem.e('channel-title'), 'truncate')}>{item.title}</div>;
	}

	private renderProgress() {
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

	private renderTime(item: api.ItemSchedule) {
		if (item) {
			return (
				<div className={bem.e('time')} key={item.startDate.toString()}>
					<FormattedTime hour12={true} value={item.startDate} />
					{' - '}
					<FormattedTime hour12={true} value={item.endDate} />
				</div>
			);
		}
	}
}
function mapStateToProps({ app }: state.Root): StateProps {
	return {
		config: app.config
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		closeModal: (id: string) => dispatch(CloseModal(id)),
		updateVideoEntryPoint: (entryPoint: VideoEntryPoint) =>
			dispatch({ type: UPDATE_PLAYER_ENTRY_POINT, payload: entryPoint })
	};
}

export default connect<{}, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(withChannelSchedule<OwnProps>(RECENT_PROGRAM_AMOUNT)(OverlayChannelSelectorItem) as any);
