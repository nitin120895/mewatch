import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { InjectedIntl } from 'react-intl';
import { Bem } from 'shared/util/styles';
import { resolveImages } from 'shared/util/images';
import { Dh1Standard as template } from 'shared/page/pageEntryTemplate';
import { getUserRating, getWatchedInfo, getBookmark, BookmarkState } from 'shared/account/profileUtil';
import { rateItem, toggleBookmark } from 'shared/account/profileWorkflow';
import { promptSignIn } from 'shared/account/sessionWorkflow';
import { removeListCache } from 'shared/cache/cacheWorkflow';
import { Bookmarks as bookmarksListId } from 'shared/list/listId';
import { getNextPlaybackItem } from 'shared/service/profile';
import { getAnonymousNextPlaybackItem as getAnonNextPlaybackItem } from 'shared/service/content';
import Picture from 'shared/component/Picture';
import { canPlay } from 'ref/responsive/pageEntry/util/offer';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { wrapValue, focusedClass } from 'ref/tv/util/focusUtil';
import { DetailHelper } from 'ref/tv/util/detailHelper';
import { getImageData } from 'ref/tv/util/itemUtils';
import BookmarkButton from 'ref/tv/pageEntry/itemDetail/dh1/components/BookmarkButton';
import RatingButton from 'ref/tv/pageEntry/itemDetail/dh1/components/RatingButton';
import RatingDisplay from 'ref/tv/pageEntry/itemDetail/dh1/components/RatingDisplay';
import PrimaryBtn from 'ref/tv/pageEntry/itemDetail/dh1/components/PrimaryBtn';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import RateModal from 'ref/tv/component/modal/RateModal';
import Description from 'ref/tv/component/Description';
import BrandImage from 'ref/tv/component/BrandImage';
import { resolveItemOrAncestor, checkShouldCollapse } from 'ref/tv/pageEntry/itemDetail/util/itemProps';
import sass from 'ref/tv/util/sass';
import './Dh1Standard.scss';

type WatchState = {
	resume: boolean;
	next: api.ItemDetail;
	hasEntitlement: boolean;
	suggestionType: 'StartWatching' | 'ContinueWatching' | 'RestartWatching' | 'Sequential' | 'None';
};

type Dh1StandardState = Partial<{
	anchorItem: api.ItemDetail;
	focused: boolean;
	focusState: 'desc' | 'actions';
	curIndex: number;
	isCollapsed: boolean;
	watchState: WatchState;
}>;

interface Dh1StandardProps extends PageEntryItemDetailProps {
	align: string;
}

interface Dh1StandardStateProps {
	device: string;
	account: state.Account;
	profile: state.Profile;
	subscriptionCode: string;
}

interface Dh1StandardDispatchProps {
	promptSignIn: () => void;
	toggleBookmark: (item: api.ItemSummary) => void;
	rateItem: (item: api.ItemSummary, rating: number, ratingScale: number) => void;
	removeListCache: (listId: string) => any;
}

type Dh1Props = Dh1StandardProps & Dh1StandardStateProps & Dh1StandardDispatchProps;

const bem = new Bem('dh1-hero');
const animationDuration = 400;

class Dh1StandardClass extends React.Component<Dh1Props, Dh1StandardState> {
	context: {
		router: ReactRouter.InjectedRouter;
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
		detailHelper: DetailHelper;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired,
		detailHelper: PropTypes.object.isRequired
	};

	private headContainer: HTMLElement;
	private actionBtns: HTMLElement[];
	private baseIndex: number;
	private focusableRow: Focusable;
	private initWatchState: WatchState = {
		resume: false,
		next: undefined,
		hasEntitlement: false,
		suggestionType: 'None'
	};

	constructor(props: Dh1Props) {
		super(props);

		const anchorItem = resolveItemOrAncestor(props);

		this.state = {
			anchorItem,
			focused: false,
			focusState: 'actions',
			curIndex: 0,
			isCollapsed: checkShouldCollapse(props.pageKey),
			watchState: this.initWatchState
		};

		this.baseIndex = (props.index + 1) * 10;

		this.focusableRow = {
			focusable: true,
			index: this.baseIndex,
			refRowType: 'detail',
			height: checkShouldCollapse(props.pageKey) ? sass.dh1CollapsedHeight : sass.dh1Height,
			forceScrollTop: true,
			template: props.template,
			entryProps: props,
			entryImageDetails: getImageData(anchorItem.images, 'wallpaper'),
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		const { isCollapsed, anchorItem } = this.state;
		const { focusNav } = this.context;

		if (this.headContainer) {
			this.focusableRow.height = isCollapsed ? sass.dh1CollapsedHeight : sass.dh1Height;
			this.focusableRow.ref = this.headContainer;
		}

		focusNav.registerRow(this.focusableRow);

		// When first mount, in collapsed mode, means it's season or episode.
		// So move focus to season selector or episode item. It will be done in D1,D2,D3 template.
		if (!isCollapsed) {
			// Move to actions row
			focusNav.moveToRow(this.focusableRow.index);
		}

		focusNav.hideGlobalHeader();

		this.getWatchedState(anchorItem, (ret: WatchState) => {
			if (this.headContainer) this.setState({ watchState: ret });
		});
	}

	componentWillReceiveProps(nextProps: Dh1Props) {
		const { account, profile } = nextProps;
		const anchorItem = resolveItemOrAncestor(nextProps);

		if (nextProps.item !== this.props.item || profile !== this.props.profile) {
			this.setState({ anchorItem });
			this.getWatchedState(anchorItem, (ret: WatchState) => {
				if (this.headContainer) this.setState({ watchState: ret });
			});
		}

		if (account.active && this.props.account.active !== account.active && this.context.focusNav.nextAction) {
			// MASTVR-786: User should be returned to the homepage
			this.goHome();
		}

		this.focusableRow.entryProps = nextProps;
		this.focusableRow.entryImageDetails = getImageData(anchorItem.images, 'wallpaper');
	}

	componentDidUpdate() {
		const { isCollapsed } = this.state;
		const { focusNav, detailHelper } = this.context;

		if (this.headContainer) {
			this.focusableRow.height = isCollapsed ? sass.dh1CollapsedHeight : sass.dh1Height;
		}

		this.focusableRow.savedState = Object.assign({}, this.state);
		focusNav.checkFocus(this.focusableRow);
		detailHelper.isInChainingPlay = false;
		focusNav.isCollapsed = isCollapsed;
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
		this.context.focusNav.isCollapsed = false;
	}

	private goHome = () => {
		this.context.router.push('/');
	};

	private getWatchedState = (item: api.ItemDetail, callback: (watchState: WatchState) => void) => {
		try {
			const { account, device, subscriptionCode } = this.props;
			const { id } = item;

			if (item.type !== 'show') {
				const watched = getWatchedInfo(id);
				const hasEntitlement = canPlay(item);

				if (watched.value && watched.value.position) {
					callback({ resume: true, next: item, hasEntitlement, suggestionType: 'None' });
				} else {
					callback({ resume: false, next: item, hasEntitlement, suggestionType: 'None' });
				}

				return;
			}

			const apiCallback = res => {
				if (res.error) {
					callback(this.initWatchState);
					return;
				}

				const nextItem = (res.data && res.data.next) || item;
				const suggestionType = res.data && res.data.suggestionType;
				const hasEntitlement = canPlay(nextItem);
				const watched = getWatchedInfo(nextItem.id);

				if (watched.value && watched.value.position) {
					callback({ resume: true, next: nextItem, hasEntitlement, suggestionType });
				} else {
					callback({ resume: false, next: nextItem, hasEntitlement, suggestionType });
				}
			};

			if (account.active) {
				getNextPlaybackItem(id, { device, expand: 'parent', sub: subscriptionCode }).then(res => {
					apiCallback(res);
				});
			} else {
				getAnonNextPlaybackItem(id, { device, expand: 'parent' }).then(res => {
					apiCallback(res);
				});
			}
		} catch (e) {
			callback(this.initWatchState);
		}
	};

	private getBookmarkState = (item: api.ItemSummary) => {
		try {
			const { account } = this.props;
			const id = item.id;
			const isSignedIn = account.active;
			const bookmark = isSignedIn && getBookmark(id);
			const bookmarked = bookmark && bookmark.state === BookmarkState.Bookmarked;
			return bookmarked;
		} catch (e) {
			return false;
		}
	};

	private getImages() {
		const images = (this.state.anchorItem || this.props.item).images;
		return {
			desktopWide: resolveImages(images, 'wallpaper', { width: sass.viewportWidth })[0].src
		};
	}

	private restoreSavedState = (savedState: object) => {
		const state = savedState as Dh1StandardState;

		if (!state) return;

		const { anchorItem, focused, focusState, curIndex, isCollapsed, watchState } = state;
		this.setState({ anchorItem, focused, focusState, curIndex, isCollapsed, watchState });
		this.getWatchedState(anchorItem, (ret: WatchState) => {
			if (this.headContainer) this.setState({ watchState: ret });
		});
	};

	private setFocus = (
		isFocus?: boolean,
		sourceLeftToViewport?: number,
		directional?: 'up' | 'down',
		isAutoFocus?: boolean
	): boolean => {
		const newState = { focused: isFocus };

		if (this.headContainer) {
			if (isFocus) {
				if (isAutoFocus) {
					this.setState(newState);
				} else {
					this.setState(Object.assign(newState, { isCollapsed: false }));
				}

				if (directional === 'down') {
					this.context.focusNav.blockScrollOnce = true;
				}
			} else {
				this.setState(newState);
			}
		}

		return true;
	};

	private moveLeft = (): boolean => {
		const { focusState, curIndex } = this.state;

		if (focusState === 'actions') {
			const tarIndex = wrapValue(curIndex - 1, 0, this.actionBtns.length - 1, false);
			this.setState({ curIndex: tarIndex });
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusState, curIndex } = this.state;

		if (focusState === 'actions') {
			const tarIndex = wrapValue(curIndex + 1, 0, this.actionBtns.length - 1, false);
			this.setState({ curIndex: tarIndex });
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { focusState, isCollapsed } = this.state;

		switch (focusState) {
			case 'actions':
				if (isCollapsed && this.context.focusNav.canPageScroll()) {
					this.setState({ isCollapsed: false });
				}
				break;

			default:
				break;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { focusState, isCollapsed } = this.state;

		switch (focusState) {
			case 'actions':
				if (!isCollapsed && this.context.focusNav.canPageScroll()) {
					this.setState({ isCollapsed: true });
					// block the page scrolling as DH1 will be collapsed
					this.context.focusNav.blockScrollOnce = true;
					setTimeout(() => {
						this.context.focusNav.pageResize();
						this.context.focusNav.analytics.triggerEntryViewed();
					}, animationDuration);
				}
				break;

			default:
				break;
		}

		return false;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				const { focusState, curIndex } = this.state;
				if (focusState === 'actions') {
					this.actionBtns[curIndex].click();
				}
				return true;

			case 'esc':
				break;

			default:
				break;
		}

		return false;
	};

	private onToggleBookmark = () => {
		const { activeProfile, removeListCache, toggleBookmark, promptSignIn } = this.props;
		removeListCache(bookmarksListId);

		if (activeProfile) {
			toggleBookmark(this.state.anchorItem);
		} else {
			this.context.focusNav.nextAction = 'bookmark';
			// Prompt sign in by active code
			promptSignIn();
		}
	};

	private onChangeRating = () => {
		if (this.props.activeProfile) {
			const { anchorItem } = this.state;
			const userRating = getUserRating(anchorItem.id);
			const rating = (userRating && userRating.value) || undefined;
			this.context.focusNav.showDialog(
				<RateModal
					title={anchorItem.title}
					defaultValue={rating / 2}
					ref={ref => ref && this.context.focusNav.setFocus(ref.focusableRow)}
					onClose={v => {
						if (v !== -1) {
							this.props.rateItem(anchorItem, v * 2, 2);
						}
					}}
				/>
			);
		} else {
			this.context.focusNav.nextAction = 'rate';
			// Prompt sign in by active code
			this.props.promptSignIn();
		}
	};

	private onRefActions = ref => {
		if (ref) {
			this.actionBtns = ref.querySelectorAll('button');
		}
	};

	private onClickBtn = () => {
		const {
			watchState: { next }
		} = this.state;
		this.context.detailHelper.onClickWatch(next, this.play);
	};

	private play = (ret: boolean) => {
		const { focusNav, intl, router } = this.context;
		const {
			watchState: { next }
		} = this.state;

		if (ret) {
			focusNav.analytics.triggerItemWatched(true, next);
			next.watchPath && router.push(next.watchPath);
		} else {
			focusNav.analytics.triggerItemWatched(false, next, intl.formatMessage({ id: 'dh1_subscriber' }));
		}
	};

	private onWatchTrailer = () => {
		const { trailers } = this.state.anchorItem;

		if (trailers.length > 0) {
			this.context.focusNav.analytics.triggerItemWatched(true, trailers[0]);
			this.context.router.push(trailers[0].watchPath);
		}
	};

	private mouseEnterAction = () => {
		this.context.focusNav.handleRowMouseEnter(this.baseIndex);
		this.setState({ isCollapsed: false, focusState: 'actions' });
	};

	private btnMouseEnter = (index: number) => {
		this.setState({ curIndex: index });
	};

	private btnMouseLeave = (index: number) => {
		this.actionBtns[index].classList.remove(focusedClass);
	};

	render() {
		if (!this.props.item) return false;

		const { focusState, focused, curIndex, isCollapsed } = this.state;
		const { className, align } = this.props;
		const blockClasses = cx(bem.b(), className);
		const isFocused = focusState === 'actions' && focused;

		return (
			<section className={blockClasses}>
				<div className={bem.e('top')}>
					{this.renderImage()}
					<div className={bem.e('head-container', { isCollapsed })} ref={ref => (this.headContainer = ref)}>
						<div className={bem.e('info', { left: align === 'left', center: align === 'center' })}>
							{this.renderTitle()}
							{this.renderMetadata()}
							{this.renderEpisodeTitle()}
							{this.renderDescription()}
							<div
								className={bem.e('actions', { isFocused, isCollapsed })}
								ref={this.onRefActions}
								onMouseEnter={this.mouseEnterAction}
							>
								{this.renderPrimaryActions(isFocused, curIndex)}
								{this.renderSecondaryActions(isFocused, curIndex)}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	private renderImage() {
		const { isCollapsed, anchorItem } = this.state;
		const imageContainerClasses = cx(bem.e('img-container', { isCollapsed }));
		const imageList = this.getImages();
		const sources = [{ src: imageList.desktopWide }];

		let backgroundColor = undefined;
		if (this.props.hasOwnProperty('defaultBackgroundColor')) backgroundColor = this.props['defaultBackgroundColor'];
		const containerStyles = backgroundColor ? { backgroundColor } : undefined;

		return (
			<div className={imageContainerClasses} style={containerStyles}>
				<Picture
					src={sources[0].src}
					sources={sources}
					description={anchorItem ? anchorItem.title : this.props.item.title}
					className={bem.e('img')}
				/>
				<div className={bem.e('img-container-cover', { isCollapsed })} />
			</div>
		);
	}

	private renderTitle() {
		const { anchorItem } = this.state;

		if (anchorItem.images && anchorItem.images.brand) {
			return this.renderBrandTitle();
		} else {
			return this.renderTextTitle();
		}
	}

	private renderBrandTitle() {
		return <BrandImage className={bem.e('brand')} item={this.state.anchorItem} contentHeight={sass.dh1Height} />;
	}

	private renderTextTitle() {
		const { isCollapsed, anchorItem } = this.state;
		return <div className={bem.e('title', { isCollapsed })}>{anchorItem.title}</div>;
	}

	private renderMetadata() {
		const { isCollapsed } = this.state;
		return (
			<div className={bem.e('metadata', { isCollapsed })}>
				{this.renderClassification()}
				{this.renderClosedCaptionsAvailability()}
				{this.renderDuration()}
				{this.renderAvailableSeasonCount()}
				{this.renderRating()}
			</div>
		);
	}

	private renderClassification() {
		const classificationObj = this.state.anchorItem.classification;
		const classification = classificationObj && classificationObj.name;
		if (!classification) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_classification|{classification}}',
			'@{itemDetail_labels_classification_aria|Rated {classification}}',
			{ classification }
		);
	}

	private renderClosedCaptionsAvailability() {
		if (!this.state.anchorItem.hasClosedCaptions) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_closed_captions|CC}',
			'@{itemDetail_labels_closed_captions_aria|Closed captions available}'
		);
	}

	private renderDuration() {
		const { type, duration } = this.state.anchorItem;
		const minutes = type === 'movie' && Math.round((duration || 0) / 60);
		if (!minutes) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_duration_minute|{minutes} mins}',
			'@{itemDetail_labels_duration_minute_aria|Duration {minutes} minutes}',
			{ minutes }
		);
	}

	private renderAvailableSeasonCount() {
		const { type, availableSeasonCount } = this.state.anchorItem;
		const season = type === 'show' && availableSeasonCount;
		if (!season) return;
		return this.renderMetadataBlock(
			'@{itemDetail_labels_season|{season, number} {season, plural, one {season} other {seasons}}}',
			'@{itemDetail_labels_season_aria|{season, number} {season, plural, one {season} other {seasons}} available}',
			{ season }
		);
	}

	private renderRating() {
		const { activeProfile, clientSide } = this.props;
		const { id, averageUserRating, totalUserRatings } = this.state.anchorItem;
		const isSignedIn = activeProfile && clientSide;
		const rating = isSignedIn && getUserRating(id);
		const userRating = rating ? rating.value : undefined;
		return <RatingDisplay averageRating={averageUserRating} userCount={totalUserRatings} userRating={userRating} />;
	}

	private renderMetadataBlock(labelId: string, ariaLabelId: string, values?: any) {
		return (
			<div className={bem.e('meta-block')}>
				<IntlFormatter tagName="p" values={values} className="sr-only">
					{ariaLabelId}
				</IntlFormatter>
				<IntlFormatter aria-hidden={true} values={values}>
					{labelId}
				</IntlFormatter>
			</div>
		);
	}

	private renderEpisodeTitle() {
		const { watchState, isCollapsed, anchorItem } = this.state;
		const { next, suggestionType } = watchState;
		let episodeTitle;

		if (
			anchorItem.type === 'show' &&
			next &&
			suggestionType !== 'StartWatching' &&
			suggestionType !== 'RestartWatching'
		) {
			episodeTitle = next.episodeName || next.title;
		}

		return (
			episodeTitle &&
			!isCollapsed && (
				<IntlFormatter
					tagName="div"
					className={bem.e('episode-title')}
					values={{
						seasonNumber: (next.season && next.season.seasonNumber) || next.seasonNumber,
						episodeNumber: next.episodeNumber,
						episodeName: episodeTitle
					}}
				>
					{`@{itemDetail_episodeDescription_episodeTitle|S{seasonNumber} E{episodeNumber} - {episodeName}}`}
				</IntlFormatter>
			)
		);
	}

	private renderDescription() {
		const { focused, focusState, anchorItem, isCollapsed, watchState } = this.state;
		const { next, suggestionType } = watchState;
		let displayItem = anchorItem;
		if (
			anchorItem.type === 'show' &&
			next &&
			suggestionType !== 'StartWatching' &&
			suggestionType !== 'RestartWatching'
		)
			displayItem = next;

		return (
			<Description
				focusable={true}
				className={cx(bem.e('description', { isCollapsed }), focused && focusState === 'desc' ? focusedClass : '')}
				description={displayItem.description || displayItem.shortDescription}
				title={displayItem.episodeName || displayItem.title}
				index={-this.baseIndex + 1}
			/>
		);
	}

	private renderPrimaryActions(focusOnAction: boolean, focusedBtnIndex: number) {
		const { watchState, anchorItem } = this.state;
		const { resume, next, hasEntitlement, suggestionType } = watchState;
		const primaryBtnClass = cx(bem.e('watch-btn'), focusOnAction && focusedBtnIndex === 0 ? focusedClass : '');

		const renderPrimaryBtn = (text: string) => {
			return (
				<PrimaryBtn
					className={primaryBtnClass}
					text={text}
					index={0}
					onMouseEnter={this.btnMouseEnter}
					onMouseLeave={this.btnMouseLeave}
					onClick={this.onClickBtn}
				/>
			);
		};

		const renderBtn = canWatch => {
			if (canWatch) {
				if (resume) {
					if (anchorItem.type !== 'show') {
						return renderPrimaryBtn(`@{dh1_resume|Resume}`);
					} else {
						// show / season / episode
						return renderPrimaryBtn(`@{dh1_resume|Resume} S${next.season.seasonNumber} E${next.episodeNumber}`);
					}
				} else {
					if (anchorItem.type !== 'show') {
						return renderPrimaryBtn(`@{dh1_watch|Watch}`);
					} else {
						// show / season / episode
						if (suggestionType === 'StartWatching' || suggestionType === 'RestartWatching') {
							return renderPrimaryBtn(`@{dh1_watch|Watch}`);
						} else {
							return renderPrimaryBtn(`@{dh1_next_episode|Next Episode}`);
						}
					}
				}
			} else {
				return renderPrimaryBtn(`@{dh1_subscriber|Subscribe}`);
			}
		};

		return <div className={bem.e('primary-actions')}>{renderBtn(hasEntitlement)}</div>;
	}

	private renderSecondaryActions(focusOnAction: boolean, focusedBtnIndex: number) {
		const { activeProfile, clientSide } = this.props;
		const { trailers } = this.state.anchorItem;
		const isSignedIn = activeProfile && clientSide;
		let bookmarkBtnIndex, ratingBtnIndex;

		if (!trailers || !trailers.length) {
			bookmarkBtnIndex = 1;
			ratingBtnIndex = 2;
		} else {
			bookmarkBtnIndex = 2;
			ratingBtnIndex = 3;
		}

		return (
			<div className={bem.e('secondary-actions')}>
				{this.renderTrailerButton(focusOnAction, focusedBtnIndex)}
				{this.renderBookmarkButton(bookmarkBtnIndex, focusOnAction, focusedBtnIndex)}
				{this.renderRatingButton(isSignedIn, ratingBtnIndex, focusOnAction, focusedBtnIndex)}
			</div>
		);
	}

	private renderTrailerButton(focusOnAction: boolean, focusedBtnIndex: number) {
		const { trailers } = this.state.anchorItem;
		if (!trailers || !trailers.length) return false;

		return (
			<PrimaryBtn
				className={cx(bem.e('watch-btn'), focusOnAction && focusedBtnIndex === 1 ? focusedClass : '')}
				text={`@{itemDetail_action_trailer|Trailer}`}
				index={1}
				onMouseEnter={this.btnMouseEnter}
				onMouseLeave={this.btnMouseLeave}
				onClick={this.onWatchTrailer}
			/>
		);
	}

	private renderBookmarkButton(index: number, focusOnAction: boolean, focusedBtnIndex: number) {
		const bookmarked = this.getBookmarkState(this.state.anchorItem);

		return (
			<BookmarkButton
				className={cx(
					bem.e('sec-btn', { isCollapsed: this.state.isCollapsed }),
					focusOnAction && index === focusedBtnIndex ? focusedClass : ''
				)}
				bookmarked={bookmarked}
				index={index}
				onClick={() => this.onToggleBookmark()}
				onMouseEnter={this.btnMouseEnter}
				onMouseLeave={this.btnMouseLeave}
			/>
		);
	}

	private renderRatingButton(isSignedIn: boolean, index: number, focusOnAction: boolean, focusedBtnIndex: number) {
		const userRating = isSignedIn && getUserRating(this.state.anchorItem.id);
		const rating = (userRating && userRating.value) || undefined;

		return (
			<RatingButton
				className={cx(
					bem.e('sec-btn', { isCollapsed: this.state.isCollapsed, rated: !!rating }),
					focusOnAction && index === focusedBtnIndex ? focusedClass : ''
				)}
				rating={rating}
				index={index}
				onClick={this.onChangeRating}
				onMouseEnter={this.btnMouseEnter}
				onMouseLeave={this.btnMouseLeave}
			/>
		);
	}
}

function mapStateToProps(state: state.Root): Dh1StandardStateProps {
	const { app, account, profile } = state;
	return {
		device: app.contentFilters.device,
		account,
		profile,
		subscriptionCode: account.info && account.info.subscriptionCode
	};
}

function mapDispatchToProps(dispatch: any): Dh1StandardDispatchProps {
	return {
		promptSignIn: () => dispatch(promptSignIn()),
		toggleBookmark: (item: api.ItemSummary) => dispatch(toggleBookmark(item)),
		rateItem: (item: api.ItemSummary, rating: number, ratingScale = 1) => dispatch(rateItem(item, rating, ratingScale)),
		removeListCache: (listId: string) => dispatch(removeListCache(listId))
	};
}

const Dh1Standard = connect<Dh1StandardStateProps, Dh1StandardDispatchProps, Dh1StandardProps>(
	mapStateToProps,
	mapDispatchToProps
)(Dh1StandardClass);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(Dh1Standard as any).template = template;
export default Dh1Standard;
