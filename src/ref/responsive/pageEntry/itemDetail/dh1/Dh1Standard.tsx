import * as cx from 'classnames';
import * as React from 'react';
import AccountButton from 'ref/responsive/component/input/AccountButton';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import RatingWrapper from 'ref/responsive/component/rating/RatingWrapper';
import { CTAAction, DhContainer, ResumePointData } from 'ref/responsive/pageEntry/itemDetail/dh1/DhContainer';
import { shouldTruncate } from 'ref/responsive/util/text';
import { BookmarkState, getBookmark } from 'shared/account/profileUtil';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { Dh1Standard as template } from 'shared/page/pageEntryTemplate';
import { noop } from 'shared/util/function';
import { resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import BookmarkButton from './components/BookmarkButton';
import ResumeProgress from './components/ResumeProgress';
import TrailerButton from './components/TrailerButton';

import './Dh1Standard.scss';

interface Dh1StandardProps extends PageEntryItemDetailProps {
	primaryAction: CTAAction;
	loading?: boolean;
	resumePointData?: ResumePointData;
	anchorItem?: api.ItemDetail;
	nextEpisode?: api.ItemDetail;
	trailers?: api.ItemSummary[];
	toggleBookmarkAction?: () => void;
	watchTrailerAction?: () => void;
	seasonNumber?: number;
	description?: string;
	showEpisodeMetadata?: boolean;
}

interface Dh1StandardState {
	descriptionTruncated?: boolean;
	hasExpandedDescription?: boolean;
}

const DESCRIPTION_LINE_COUNT = 5;

const bem = new Bem('dh1-hero');

class Dh1Standard extends React.Component<Dh1StandardProps, Dh1StandardState> {
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
		window.addEventListener('resize', this.truncateText, false);
		this.truncateText();
	}

	componentWillReceiveProps(nextProps: Dh1StandardProps) {
		if (nextProps.anchorItem !== this.props.anchorItem || nextProps.nextEpisode !== this.props.nextEpisode) {
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
		if (prevProps.anchorItem !== this.props.anchorItem || prevProps.nextEpisode !== this.props.nextEpisode) {
			this.truncateText();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.truncateText);
	}

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
		if (!this.props.anchorItem) return false;

		const blockClasses = cx(bem.b(), this.props.className);
		return (
			<section className={blockClasses}>
				<div className={bem.e('top')}>
					<div className={bem.e('head-container')}>
						<div className={bem.e('info')}>
							{this.renderTitle()}
							{this.renderMetadata()}
							<div className={bem.e('actions')}>
								{this.renderPrimaryActions()}
								{this.renderSecondaryActions()}
							</div>
							{this.renderResumePoint()}
							{this.renderDescription()}
							{this.renderSecondaryActions(true)}
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
			return this.renderTextTitle();
		}
	}

	private renderBrandTitle() {
		const { images, title } = this.props.anchorItem;
		const src = resolveImages(images, 'brand', { width: 640, format: 'png' })[0].src;
		return <img src={src} className={bem.e('brand')} alt={title} />;
	}

	private renderTextTitle() {
		return <h1 className={cx(bem.e('title'), 'heading-shadow')}>{this.props.anchorItem.title}</h1>;
	}

	private renderMetadata() {
		return (
			<div className={bem.e('metadata')}>
				{this.renderClassification()}
				{this.renderClosedCaptionsAvailability()}
				{this.renderDuration()}
				{this.renderAvailableSeasonCount()}
				{this.renderRatingWrapper('rating')}
			</div>
		);
	}

	private renderClassification() {
		const classificationObj = this.props.anchorItem.classification;
		const classification = classificationObj && classificationObj.name;
		if (!classification) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_classification|{classification}}',
			'@{itemDetail_labels_classification_aria|Rated {classification}}',
			{ classification }
		);
	}

	private renderClosedCaptionsAvailability() {
		if (!this.props.anchorItem.hasClosedCaptions) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_closed_captions|CC}',
			'@{itemDetail_labels_closed_captions_aria|Closed captions available}'
		);
	}

	private renderDuration() {
		const { type, duration } = this.props.anchorItem;
		const minutes = type === 'movie' && Math.round((duration || 0) / 60);
		if (!minutes) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_duration_minute|{minutes} mins}',
			'@{itemDetail_labels_duration_minute_aria|Duration {minutes} minutes}',
			{ minutes }
		);
	}

	private renderAvailableSeasonCount() {
		const { type, availableSeasonCount } = this.props.anchorItem;
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
		const { loading, primaryAction } = this.props;
		const { label, type, data, onClick } = primaryAction;

		return (
			<div className={bem.e('primary-actions')}>
				<TriggerProvider trigger="dh1_primary">
					<IntlFormatter
						formattedProps={{ label }}
						elementType={
							(props => {
								return (
									<CTAWrapper type={type} data={{ ...data, title: props.label }}>
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
			</div>
		);
	}

	private renderSecondaryActions(bottom?: boolean) {
		return (
			<div className={bem.e('secondary-actions', { bottom })}>
				{this.renderTrailerButton()}
				{this.renderBookmarkButton()}
				{this.renderRatingWrapper('rate')}
			</div>
		);
	}

	private renderTrailerButton() {
		const { trailers } = this.props;
		if (!trailers || !trailers.length) return false;

		const { watchTrailerAction } = this.props;
		return <TrailerButton className={bem.e('sec-btn')} onClick={watchTrailerAction} />;
	}

	private renderBookmarkButton() {
		const { activeProfile, clientSide, toggleBookmarkAction } = this.props;
		const isSignedIn = activeProfile && clientSide;

		const bookmark = isSignedIn && getBookmark(this.props.anchorItem.id);
		const bookmarked = bookmark && bookmark.state === BookmarkState.Bookmarked;
		return (
			<TriggerProvider trigger="dh1_bookmark">
				<BookmarkButton className={bem.e('sec-btn')} bookmarked={bookmarked} onClick={toggleBookmarkAction} />
			</TriggerProvider>
		);
	}

	private renderRatingWrapper = (component: string) => {
		return <RatingWrapper item={this.props.anchorItem} component={component} />;
	};

	private renderResumePoint() {
		const { resumePointData } = this.props;
		if (!resumePointData) return false;

		const { duration, resumePoint, title } = resumePointData;
		if (!resumePoint || !duration) return false;

		return <ResumeProgress className={bem.e('progress')} resumePoint={resumePoint} duration={duration} title={title} />;
	}

	private renderDescription() {
		const { description } = this.props;
		return (
			<div className={bem.e('wrapper')} onClick={this.onClick}>
				{this.renderEpisodeMetadata()}
				<p className={bem.e('description', { truncated: this.state.descriptionTruncated })} ref={this.onDescriptionRef}>
					{description}
				</p>
			</div>
		);
	}

	private renderEpisodeMetadata() {
		const { nextEpisode, seasonNumber, showEpisodeMetadata } = this.props;
		if (showEpisodeMetadata && nextEpisode) {
			return (
				<p className={bem.e('episode-metadata')}>{`S${seasonNumber} E${nextEpisode.episodeNumber} - ${
					nextEpisode.episodeName
				}`}</p>
			);
		}

		return false;
	}
}

const Component: any = DhContainer(Dh1Standard);
Component.template = template;
export default Component;
