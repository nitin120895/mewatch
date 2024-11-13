import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { shouldTruncate } from 'ref/responsive/util/text';

import { PROMISED_BOOKMARK_KEY, BookmarkState, getBookmark } from 'shared/account/profileUtil';
import { CTATypes, VideoEntryPoint } from 'shared/analytics/types/types';
import { setPrimaryData } from 'shared/app/appWorkflow';
import { Dh1Standard as template } from 'shared/page/pageEntryTemplate';
import { noop } from 'shared/util/function';
import { resolveImages } from 'shared/util/images';
import { isMovie } from 'shared/util/itemUtils';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';
import { getItem, removeItem } from 'shared/util/sessionStorage';

import { CTAAction, DhContainer, ResumePointData } from 'toggle/responsive/pageEntry/itemDetail/dh1/DhContainer';
import { isSeason, isEpisodicSeries } from 'toggle/responsive/util/item';
import { getProviderGroupName, replacePlaceholder } from 'toggle/responsive/util/subscriptionUtil';

import AccountButton from 'ref/responsive/component/input/AccountButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import ResumeProgress from 'ref/responsive/pageEntry/itemDetail/dh1/components/ResumeProgress';
import TrailerButton from 'ref/responsive/pageEntry/itemDetail/dh1/components/TrailerButton';
import AddToWatchlistContainer from 'toggle/responsive/pageEntry/itemDetail/dh1/components/AddToWatchlistContainer';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import Badge from 'toggle/responsive/component/Badge';
import ShopButton from 'toggle/responsive/component/ShopButton';
import PartnerLogo from 'toggle/responsive/component/PartnerLogo';

import './Dh1Standard.scss';

interface Dh1StandardProps extends PageEntryItemDetailProps {
	primaryAction: CTAAction;
	loading?: boolean;
	resumePointData: ResumePointData;
	anchorItem?: api.ItemDetail;
	nextEpisode?: api.ItemDetail;
	trailers?: api.ItemSummary[];
	toggleBookmarkAction?: () => void;
	watchTrailerAction?: () => void;
	seasonNumber?: number;
	description?: string;
	showEpisodeMetadata?: boolean;
	showPartnerLogo: boolean;
	config?: api.AppConfig;
}

interface Dh1StandardState {
	descriptionTruncated?: boolean;
	hasExpandedDescription?: boolean;
}

interface DispatchProps {
	updateAppPrimaryData: (primaryAction?: any) => void;
}

type Props = Dh1StandardProps & DispatchProps;

const DESCRIPTION_LINE_COUNT = 5;

const bem = new Bem('dh1-hero');

class Dh1Standard extends React.Component<Props, Dh1StandardState> {
	static defaultProps = {
		resumePoint: 0,
		primaryAction: { click: noop, label: '' },
		toggleBookmarkAction: noop,
		watchTrailerAction: noop,
		setBackgroundImage: noop
	};

	private description: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			descriptionTruncated: false,
			hasExpandedDescription: false
		};
	}

	componentDidMount() {
		const { primaryAction, updateAppPrimaryData } = this.props;
		const { label } = primaryAction;
		window.addEventListener('resize', this.truncateText, false);
		this.checkBookmarks();
		this.truncateText();
		if (label !== '') {
			updateAppPrimaryData(primaryAction);
		}
	}

	componentWillReceiveProps(nextProps: Dh1StandardProps) {
		const { anchorItem, nextEpisode } = this.props;
		if (nextProps.anchorItem !== anchorItem || nextProps.nextEpisode !== nextEpisode) {
			this.setState((prevState, props) => {
				return {
					ratingOpened: false,
					descriptionTruncated: false,
					hasExpandedDescription: false
				};
			});
		}
	}

	componentDidUpdate(prevProps: Dh1StandardProps) {
		const { primaryAction, anchorItem, nextEpisode, updateAppPrimaryData } = this.props;
		const { label } = primaryAction;
		if (prevProps.anchorItem !== anchorItem || prevProps.nextEpisode !== nextEpisode) {
			this.truncateText();
			if (label !== '') {
				updateAppPrimaryData(primaryAction);
			}
		}
	}

	componentWillUnmount() {
		const { updateAppPrimaryData } = this.props;
		window.removeEventListener('resize', this.truncateText);
		updateAppPrimaryData(undefined);
	}

	private checkBookmarks = () => {
		if (getItem(PROMISED_BOOKMARK_KEY)) {
			removeItem(PROMISED_BOOKMARK_KEY);
		}
	};

	private truncateText = () => {
		if (!this.description || this.state.hasExpandedDescription) {
			// If props.item wasn't received on mount then the render is skipped which means these refs won't exist yet.
			return;
		}
		const descriptionTruncated = shouldTruncate(this.description, DESCRIPTION_LINE_COUNT);
		this.setState({ descriptionTruncated });
	};

	private onDescriptionRef = (ref: HTMLElement) => {
		this.description = ref;
	};

	private onClick = () => {
		if (this.state.descriptionTruncated) {
			this.setState({
				hasExpandedDescription: true
			});
		}

		this.setState({
			descriptionTruncated: false
		});
	};

	render() {
		const { className, anchorItem } = this.props;
		if (!anchorItem) return false;

		const blockClasses = cx(bem.b(), className);
		const noHeroImage = !anchorItem.images || !anchorItem.images.wallpaper;

		return (
			<section className={blockClasses}>
				<div className={bem.e('top')}>
					<div className={bem.e('head-container')}>
						<div className={bem.e('info', { 'no-hero-image': noHeroImage })}>
							{this.renderTitle()}
							{this.renderMetadata()}
							<div className={bem.e('actions')}>
								{this.renderPrimaryActions()}
								{this.renderSecondaryActions()}
							</div>
							{this.renderResumePoint()}
							{this.renderSecondaryActions(true)}
							{this.renderDescription()}
						</div>
					</div>
				</div>
			</section>
		);
	}

	private renderTitle() {
		const { anchorItem } = this.props;
		if (anchorItem.images && anchorItem.images.brand) {
			return this.renderBrandTitle();
		} else {
			return [this.renderTextTitle(), this.renderSecondaryTitle()];
		}
	}

	private renderSecondaryTitle() {
		const { anchorItem } = this.props;
		const secondaryLanguageTitle = anchorItem.secondaryLanguageTitle;

		if (!secondaryLanguageTitle) return false;
		return (
			<h2 key="secondary-title" className={cx(bem.e('secondary-title'))}>
				{secondaryLanguageTitle}
			</h2>
		);
	}

	private renderBrandTitle() {
		const { anchorItem } = this.props;
		const { images, title } = anchorItem;
		const src = resolveImages(images, 'brand', { width: 640, format: 'png' })[0].src;
		return (
			<div className={bem.e('brand')}>
				<div className={bem.e('brand-img-wrap')}>
					<img src={src} className={bem.e('brand-img')} alt={title} />
				</div>
			</div>
		);
	}

	private renderTextTitle() {
		const { anchorItem } = this.props;
		return (
			<div key="title" className={cx(bem.e('title'), 'heading-shadow')}>
				{this.renderBadge()}
				<h1 className={bem.e('title-text')}>{anchorItem.title}</h1>
			</div>
		);
	}

	private renderBadge() {
		const { anchorItem } = this.props;
		return anchorItem.badge && <Badge item={anchorItem} className={bem.e('badge')} mod="dh1" />;
	}

	private renderMetadata() {
		return (
			<div className={bem.e('metadata')}>
				{this.renderAvailableChannels()}
				{this.renderAudioLanguages()}
				<div className={bem.e('metadata-content')}>
					{this.renderClassification()}
					{this.renderDuration()}
					{this.renderAvailableSeasonCount()}
				</div>
			</div>
		);
	}

	private renderAvailableChannels() {
		const { anchorItem } = this.props;
		const { customFields } = anchorItem;
		const channel = customFields && customFields.Channel;

		if (!channel) return;
		return (
			<div className={bem.e('meta-block-channel')}>
				<IntlFormatter className={bem.e('meta-block-channel', 'label')}>
					{'@{itemDetail_label_channel| Channel}'}:
				</IntlFormatter>
				<div className={bem.e('meta-block-channel', 'item')}>{channel} &nbsp;|</div>
			</div>
		);
	}

	private renderAudioLanguages() {
		const { anchorItem } = this.props;
		const audioLanguages = get(anchorItem.customFields, 'AudioLanguages');
		if (!audioLanguages) return;
		return (
			<div className={bem.e('meta-audio-languages')}>
				<IntlFormatter className={bem.e('meta-audio-languages', 'label')}>
					{'@{audioLanguage_label| Audio}'}:
				</IntlFormatter>
				{audioLanguages.map(item => item).join(', ')}
				&nbsp;
			</div>
		);
	}

	private renderClassification() {
		const { anchorItem, item } = this.props;
		const classificationObj = anchorItem.classification || item.classification;
		const classification = classificationObj && classificationObj.name;
		if (!classification) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_classification|{classification}}',
			'@{itemDetail_labels_classification_aria|Rated {classification}}',
			{ classification }
		);
	}

	private renderDuration() {
		const { anchorItem } = this.props;
		const { type, duration } = anchorItem;
		const minutes = type === 'movie' && Math.round((duration || 0) / 60);
		if (!minutes) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_duration_minute|{minutes} mins}',
			'@{itemDetail_labels_duration_minute_aria|Duration {minutes} minutes}',
			{ minutes }
		);
	}

	private renderAvailableSeasonCount() {
		const { anchorItem } = this.props;
		const { type, availableSeasonCount } = anchorItem;
		const season = type === 'show' && availableSeasonCount;
		if (!season) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_season|{season, number} {season, plural, one {season} other {seasons}}}',
			'@{itemDetail_labels_season_aria|{season, number} {season, plural, one {season} other {seasons}} available}',
			{ season }
		);
	}

	private renderMetadataBlock(label: string, ariaLabel: string, values?) {
		return (
			<div className={bem.e('meta-block')}>
				<IntlFormatter elementType="p" values={values} className="sr-only">
					{ariaLabel}
				</IntlFormatter>
				<IntlFormatter aria-hidden={true} values={values}>
					{label}
				</IntlFormatter>
			</div>
		);
	}

	private renderPrimaryActions() {
		const { loading, primaryAction, showPartnerLogo, item, config } = this.props;
		const { label, type, data, onClick } = primaryAction;
		const provider = get(item, 'customFields.Provider');
		const providerGroupName = getProviderGroupName(config, provider);
		const cessationIDPFallbackMessage =
			'$CPNAME subscription is no longer offered on mewatch. This programme is accessible to existing subscribers until their subscription ends on or before $CESSATIONDATE.';
		let cessationIDPMessage =
			(providerGroupName &&
				get(config, `general.customFields.CessationIDPMessage.${providerGroupName}.cessationMessage`)) ||
			cessationIDPFallbackMessage;
		const { cpName = '', date: cessationDate = '' } =
			get(config, `general.customFields.CessationProviderDetails.${providerGroupName}`) || {};

		// Replace "$CPNAME" if it exists
		cessationIDPMessage = replacePlaceholder(cessationIDPMessage, '$CPNAME', cpName);
		// Replace "$CESSATIONDATE" if it exists
		cessationIDPMessage = replacePlaceholder(cessationIDPMessage, '$CESSATIONDATE', cessationDate);

		let cessationDisclaimer = cessationIDPMessage;
		const displayLogo = provider && showPartnerLogo;
		const isCessationContent = label === provider;

		return (
			<div className={cx(bem.e('primary-actions'))}>
				{!isCessationContent ? (
					<TriggerProvider trigger="dh1_primary">
						<IntlFormatter
							formattedProps={{ label }}
							elementType={
								(props => {
									return (
										<CTAWrapper
											type={type}
											data={{ ...data, title: props.label, entryPoint: VideoEntryPoint.IDPWatch }}
										>
											<AccountButton
												ordinal={'primary'}
												large={true}
												type={'button'}
												theme={'dark'}
												spinnerLocation={'center'}
												loading={loading}
												onClick={onClick}
											>
												{props.label}
											</AccountButton>
										</CTAWrapper>
									);
								}) as any
							}
						/>
					</TriggerProvider>
				) : (
					<IntlFormatter className="cessation-disclaimer">{cessationDisclaimer}</IntlFormatter>
				)}
				{displayLogo && <PartnerLogo item={item} imageWidth={{ mobile: 88, tablet: 103, desktopWide: 128 }} />}
			</div>
		);
	}

	private renderSecondaryActions(bottom?: boolean) {
		const { item } = this.props;
		const customFieldsUrlExists = Boolean(get(item, 'customFields.Url'));
		return (
			<div className={bem.e('secondary-actions', { bottom, padding: customFieldsUrlExists })}>
				{customFieldsUrlExists && this.renderShopButton(item.customFields.Url)}
				{this.renderTrailerButton()}
				{this.renderAddToWatchListButton()}
				{/* hiding share Button temporarily and removed ADDTHisshare widget component */}
				{/* <ShareButton item={item} /> */}
			</div>
		);
	}

	private renderAddToWatchListButton() {
		const { activeProfile, clientSide, toggleBookmarkAction, anchorItem } = this.props;

		const isSignedIn = activeProfile && clientSide;
		const watchList = isSignedIn && getBookmark(anchorItem.id);
		const addedToWatchList = watchList && watchList.state === BookmarkState.Bookmarked;

		return (
			<AddToWatchlistContainer
				addedToWatchlist={addedToWatchList}
				className={bem.e('sec-btn')}
				onClick={toggleBookmarkAction}
			/>
		);
	}

	private renderShopButton(url) {
		const { item } = this.props;
		const shopUrl = url.split('|');
		return (
			<CTAWrapper type={CTATypes.IDPLink} data={{ linkUrl: shopUrl[0], item }}>
				<ShopButton shopUrl={shopUrl[0]} />
			</CTAWrapper>
		);
	}

	private renderTrailerButton() {
		const { trailers } = this.props;
		if (!trailers || !trailers.length) return false;

		const { watchTrailerAction } = this.props;
		return (
			<CTAWrapper type={CTATypes.Trailer} data={{ item: trailers[0], entryPoint: VideoEntryPoint.IDPTrailer }}>
				<TrailerButton className={bem.e('sec-btn')} onClick={watchTrailerAction} />
			</CTAWrapper>
		);
	}

	private renderResumePoint() {
		const { resumePointData } = this.props;
		if (!resumePointData) return false;

		const { duration, resumePoint, title } = resumePointData;
		if (!resumePoint || !duration) return false;

		return <ResumeProgress className={bem.e('progress')} resumePoint={resumePoint} duration={duration} title={title} />;
	}

	private renderDescription() {
		const { nextEpisode, seasonNumber, anchorItem, item, resumePointData } = this.props;
		const hasNext = !!nextEpisode && canPlay(nextEpisode);
		let description = !isMovie(item) && anchorItem ? anchorItem.description : this.props.description;
		const { resumePoint, duration } = resumePointData;
		const hasWatched = !!(resumePoint && duration);

		if (isSeason(item) && nextEpisode && hasWatched) {
			description = nextEpisode.description;
		}

		return (
			<div className={bem.e('wrapper')} onClick={this.onClick}>
				{hasNext && hasWatched && (
					<p className={bem.e('episode-metadata')}>
						{isEpisodicSeries(item) ? `S${seasonNumber} ${nextEpisode.episodeName}` : nextEpisode.episodeName}
					</p>
				)}
				<p className={bem.e('description', { truncated: this.state.descriptionTruncated })} ref={this.onDescriptionRef}>
					{description}
				</p>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateAppPrimaryData: primaryAction => {
			dispatch(setPrimaryData(primaryAction));
		}
	};
}

const Component: any = connect<any, DispatchProps, any>(
	undefined,
	mapDispatchToProps
)(DhContainer(Dh1Standard));
Component.template = template;
export default Component;
