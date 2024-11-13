import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { wrapCarousel } from 'shared/analytics/components/ItemWrapper';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import { isWatchPath } from 'shared/app/routeUtil';
import Link from 'shared/component/Link';
import Picture from 'shared/component/Picture';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { fallbackURI } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import { addQueryParameterToURL } from 'shared/util/urls';
import { browserHistory } from 'shared/util/browserHistory';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';
import { isChannel } from 'toggle/responsive/util/epg';
import { CLICK_TO_PLAY_QUERY_PARAM, FULLSCREEN_QUERY_PARAM } from 'toggle/responsive/util/playerUtil';
import { isExternalUrl } from 'toggle/responsive/util/urlUtil';

import withClickToPlay, { ClickToPlayProps } from 'toggle/responsive/component/withClickToPlay';
import Badge from 'toggle/responsive/component/Badge';

const BemCarouselItem = new Bem('carousel-item');
const BemCarouselText = new Bem('carousel-text');

interface OwnProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	index: number;
	imageType: image.Type;
	sources: image.Source[];
	brandImage: string;
	badgeImage: string;
	selected?: boolean;
	onItemClick?: (transform: number) => void;
	onLoad?: () => void;
	onError?: (e?) => void;
	style?: {
		top: string;
	};
	isInView: boolean;
	isLink: boolean;
	itemTransitionsDisabled: boolean;
	imageOffsetTop?: string;
	translate: number;
}

interface DispatchProps {
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type ItemProps = OwnProps & ClickToPlayProps & DispatchProps;

interface ItemState {
	loading: boolean;
}

class CarouselItem extends React.Component<ItemProps, ItemState> {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
	}

	onClick = e => {
		const { onItemClick, translate, isInView, item, clickToPlay, updateSubscriptionEntryPoint } = this.props;

		updateSubscriptionEntryPoint(MixpanelEntryPoint.Carousel);

		// External links should be treated as regular <a> elements.
		if (isExternalUrl(item.path)) {
			return;
		}

		// From here on we're using built in logic to determine what should be
		// done after the user interacts with the element.
		e.preventDefault();

		// MEDTOG-15926 Redirect to channel page from watch page for linear assets
		if (isWatchPath(item.path) && !this.state.loading) {
			this.handleClickForChannelWatchPaths();
			return;
		}

		if (isInView) {
			clickToPlay(item, {
				defaultBehaviour: () => browserHistory.push(item.path)
			});
		} else {
			if (onItemClick) onItemClick(translate);
		}
	};

	handleClickForChannelWatchPaths = () => {
		// As fetching item is a slow step, users might click many times hence we check for loading state before fetching
		this.setState({ loading: true });

		const { item } = this.props;
		const { path: itemWatchPath } = item;
		const watchPathArray = itemWatchPath.split('/');
		const itemId = watchPathArray[watchPathArray.length - 1];

		// Check if item is a channel before redirection to channel path
		getUpdatedItem(itemId)
			.then(res => {
				const itemPath = isChannel(res) ? res.path : itemWatchPath;
				const itemFullPath = addQueryParameterToURL(itemPath, {
					redirect: true,
					[FULLSCREEN_QUERY_PARAM]: true,
					[CLICK_TO_PLAY_QUERY_PARAM]: true
				});
				browserHistory.push(itemFullPath);
			})
			.catch(e => {
				browserHistory.push('/404');
			})
			.finally(() => {
				this.setState({ loading: false });
			});
	};

	private renderBadge() {
		const { item } = this.props;

		return item.badge && <Badge item={item} className={BemCarouselText.e('badge')} mod="hero" />;
	}

	render() {
		const {
			item,
			onLoad,
			onError,
			sources,
			brandImage,
			badgeImage,
			isInView,
			style,
			isLink,
			itemTransitionsDisabled,
			imageOffsetTop
		} = this.props;
		const isBrand = brandImage !== fallbackURI;
		const hasBadge = badgeImage !== fallbackURI;
		const hasTagline = !!item.tagline;

		let carouselTextClasses = cx(BemCarouselText.b({ 'large-title': item.title.length > 16 }), {
			'carousel-text--badge-image': hasBadge
		});
		let carouselTextTitleClasses = cx(
			BemCarouselText.e('title'),
			{
				[BemCarouselText.e('title', ['hidden'])]: isBrand
			},
			'heading-shadow'
		);

		if (imageOffsetTop) style.top = `${imageOffsetTop}px`;

		return (
			<Link
				key={'link-' + item.path}
				to={item.path}
				className={BemCarouselItem.b({
					'transitions-enabled': !itemTransitionsDisabled,
					'in-view': isInView,
					link: isLink
				})}
				style={style}
				tabIndex={isInView ? 0 : -1}
				onClick={this.onClick}
			>
				<Picture
					src={sources[0].src}
					sources={sources}
					description="description"
					onLoad={onLoad ? onLoad : undefined}
					onError={onError ? onError : undefined}
					className={BemCarouselItem.e('banner')}
					imageClassName={BemCarouselItem.e('image')}
				/>
				{hasBadge && <img src={badgeImage} className={BemCarouselText.e('badge-image')} aria-hidden="true" />}
				<div className={carouselTextClasses}>
					{hasTagline && <p className={BemCarouselText.e('tagline')}>{item.tagline}</p>}
					{isBrand && <img src={brandImage} className={BemCarouselText.e('picture')} alt={item.title} />}
					{!isLink && <h2 className={carouselTextTitleClasses}>{item.title}</h2>}
					{this.renderBadge()}
				</div>
			</Link>
		);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

export default connect<{}, DispatchProps, OwnProps>(
	undefined,
	mapDispatchToProps
)(wrapCarousel(withClickToPlay<ItemProps>()(CarouselItem)));
