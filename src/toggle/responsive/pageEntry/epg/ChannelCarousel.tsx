import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { resolveImage } from 'shared/util/images';
import Badge from 'toggle/responsive/component/Badge';
import { checkNeedToResize, scrollCarouselToActiveItem } from '../utils/epg';
import Scrollable, { AdaptiveScroll } from '../../component/Scrollable';
import { getColumnClasses, isPortrait, isSmallTabletSize, isLessThanTabletSize } from '../../util/grid';
import { SCROLL_ON_RESIZE_TIMEOUT } from './datepicker/DateCarousel';
import NavScrollableList from '../../app/nav/NavScrollableList';
import { get } from 'shared/util/objects';

import './ChannelCarousel.scss';

const bemChannelCarousel = new Bem('channel-carousel');
const columns: grid.BreakpointColumn[] = [{ phone: 12 }, { phablet: 12 }, { tablet: 6 }, { tabletLandscape: 4 }];
const ADDITION_TO_SCROLL_PER_PAGE = 0.5;
const MOBILE_SCROLL_PER_PAGE = 2;
const TABLET_SCROLL_PER_PAGE = 5;
const DESKTOP_SCROLL_PER_PAGE = 7;

interface Props {
	list: api.ItemList;
	activeChannel: api.ItemSummary;
	onChange: (channel: api.ItemSummary) => void;
	loadNextListPage: (list: api.ItemList) => {};
}

export default class ChannelCarousel extends React.Component<Props> {
	activeChannelRef: HTMLElement;
	scrollContainer: Scrollable;
	onResizeTimeout: number;
	initialWidth = window.outerWidth;
	initialHeight = window.outerHeight;

	componentDidMount() {
		scrollCarouselToActiveItem(this.scrollContainer, this.activeChannelRef);
		window.addEventListener('resize', this.onResize, false);
	}

	componentWillUpdate(nextProps: Props) {
		if (get(this.props, 'activeChannel.id') !== get(nextProps, 'activeChannel.id')) {
			this.activeChannelRef = undefined;
		}
	}

	componentDidUpdate(prevProps: Props) {
		if (get(this.props, 'activeChannel.id') !== get(prevProps, 'activeChannel.id')) {
			scrollCarouselToActiveItem(this.scrollContainer, this.activeChannelRef, true);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		clearTimeout(this.onResizeTimeout);
	}

	onResize = () => {
		// This check is added to avoid resetScroll calling on scroll for some android devices where browser
		// shows/hides navigation bar on scroll and trigger resize event.
		if (checkNeedToResize({ width: this.initialWidth, height: this.initialHeight })) {
			clearTimeout(this.onResizeTimeout);
			this.onResizeTimeout = window.setTimeout(this.resetScroll, SCROLL_ON_RESIZE_TIMEOUT);
			this.initialWidth = window.outerWidth;
			this.initialHeight = window.outerHeight;
		}
	};

	resetScroll = () => {
		scrollCarouselToActiveItem(this.scrollContainer, this.activeChannelRef);
	};

	render() {
		const { list, loadNextListPage } = this.props;

		return (
			<div className={bemChannelCarousel.b()}>
				<NavScrollableList
					className={bemChannelCarousel.e('scrollable')}
					list={list}
					allowProgressBar={false}
					loadNextListPage={loadNextListPage}
					renderChannel={this.renderChannel}
					setScrollContainerRef={this.setScrollContainerRef}
					getScrolableAdaptiveScroll={this.getScrollableAdaptiveScroll()}
					checkNeedToResize={() => checkNeedToResize({ width: this.initialWidth, height: this.initialHeight })}
					resetEndPosition
				/>
			</div>
		);
	}

	private getScrollPerPage = () => {
		// Calculating how many items we need to scroll per page, at the beginning and at the end of the list

		if (isLessThanTabletSize()) {
			return ADDITION_TO_SCROLL_PER_PAGE / MOBILE_SCROLL_PER_PAGE;
		} else if (isPortrait() && isSmallTabletSize()) {
			return ADDITION_TO_SCROLL_PER_PAGE / TABLET_SCROLL_PER_PAGE;
		} else {
			return ADDITION_TO_SCROLL_PER_PAGE / DESKTOP_SCROLL_PER_PAGE;
		}
	};

	getScrollableAdaptiveScroll = (): AdaptiveScroll => {
		return {
			scrollPerPage: this.getScrollPerPage(),
			startScrollPerPage: 0
		};
	};

	private renderBadge(channel) {
		return channel.badge && <Badge item={channel} className={bemChannelCarousel.e('badge')} mod="epg" />;
	}

	renderChannel = (channel: api.ItemSummary) => {
		const { onChange, activeChannel } = this.props;
		const logo = resolveImage(channel.images, 'logo', { width: 200, format: 'png' });
		const className = !logo.resolved ? 'no-logo' : '';

		return (
			<div
				ref={e => this.setActiveChannelRef(e, channel.id)}
				key={channel.id}
				className={cx(...getColumnClasses(columns))}
			>
				<div
					className={bemChannelCarousel.e('channel', { selected: channel.id === activeChannel.id })}
					onClick={() => onChange(channel)}
				>
					{this.renderBadge(channel)}

					<div className={bemChannelCarousel.e('flex-container')}>
						<div className={bemChannelCarousel.e('logo-container')}>
							{logo.resolved && <img src={logo.src} className={bemChannelCarousel.e('logo')} />}
						</div>
						<span className={cx(bemChannelCarousel.e('title'), className)}>{channel.title}</span>
					</div>
				</div>
				<div className={bemChannelCarousel.e('marker', { visible: channel.id === activeChannel.id })} />
			</div>
		);
	};

	setScrollContainerRef = (ref: Scrollable) => {
		if (!this.scrollContainer) this.scrollContainer = ref;
	};

	setActiveChannelRef = (ref: any, channelId: string) => {
		if (!this.activeChannelRef && channelId === this.props.activeChannel.id) {
			this.activeChannelRef = findDOMNode<HTMLElement>(ref);
			scrollCarouselToActiveItem(this.scrollContainer, this.activeChannelRef);
		}
	};
}
