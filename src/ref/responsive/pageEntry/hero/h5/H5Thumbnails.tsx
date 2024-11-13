import * as React from 'react';
import Carousel from '../common/Carousel';
import { Bem } from 'shared/util/styles';
import Picture from 'shared/component/Picture';
import RowCarousel from '../common/RowCarousel';
import * as cx from 'classnames';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import PageScroll from 'ref/responsive/util/PageScroll';

import './H5Thumbnails.scss';

const bemH5Navigation = new Bem('h5-navigation');
const bemCarousel = new Bem('carousel');

let pageScroller;

interface H5ThumbnailsState {
	carouselIndex?: number;
	crop?: boolean;
	cropRemainder?: number;
	oneItem?: boolean;
	items?: any;
	rowCarouselIndex?: number;
	autoPlayToggle?: boolean;
}

interface H5ThumbnailsProps extends PageEntryListProps {
	// turn autoplay on and off
	autoPlayToggle?: boolean;

	// on autoplay state change
	onAutoPlayingChange?: (state: boolean) => void;

	// on autoplay enabled state change
	onAutoPlayEnabledChange?: (state: boolean) => void;
}

export default class H5Thumbnails extends React.Component<H5ThumbnailsProps, H5ThumbnailsState> {
	private carousel: HTMLElement;
	private transitionDisabled = false;

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			carouselIndex: 0,
			rowCarouselIndex: 0,
			autoPlayToggle: true,
			oneItem: props.list.items.length === 1
		};
	}

	componentDidMount() {
		this.imageFitsWindow();
		this.setState({ oneItem: this.props.list.items.length === 1 });
		window.addEventListener('resize', this.onResize, false);

		pageScroller = new PageScroll({
			duration: 50,
			scrollType: 'scrollTop',
			element: [document.body, document.documentElement]
		});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	componentWillReceiveProps(nextProps) {
		const { autoPlayToggle } = nextProps;
		if (this.props.autoPlayToggle !== autoPlayToggle) {
			this.setState({ autoPlayToggle });
		}
	}

	private imageFitsWindow() {
		this.setState({
			crop: window.innerHeight / window.innerWidth < 0.5625,
			cropRemainder: window.innerHeight
		});
	}

	private transitionCarousel(id) {
		if (this.transitionDisabled) return;
		const index = this.getIndexFromId(id);
		this.setState({
			carouselIndex: index,
			rowCarouselIndex: index,
			autoPlayToggle: false
		});
		if (this.props.onAutoPlayEnabledChange) {
			this.props.onAutoPlayEnabledChange(false);
		}
	}

	private getIndexFromId(id) {
		const { items } = this.state;
		let { carouselIndex } = this.state;
		items.forEach((item, i) => {
			if (item.item.id === id) carouselIndex = i;
		});
		return carouselIndex;
	}

	private onResize = () => {
		window.requestAnimationFrame(() => {
			this.imageFitsWindow();
		});
	};

	private onItemIndex = index => {
		let newState: H5ThumbnailsState = { carouselIndex: index };
		if (this.state.autoPlayToggle) newState.rowCarouselIndex = index;
		this.setState(newState);
	};

	private onAutoPlayingChange = state => {
		if (this.props.onAutoPlayingChange) {
			this.props.onAutoPlayingChange(state);
		}
	};

	private onTransitionDisabledState = state => (this.transitionDisabled = state);
	private onItems = items => this.setState({ items: items });
	private onCarouselRef = node => (this.carousel = node);
	private scroll = () => {
		pageScroller.scroll(this.carousel.offsetHeight, document.body.scrollTop || document.documentElement.scrollTop);
	};
	private onRowCarouselTransition = () => {
		this.setState({ autoPlayToggle: false });
	};

	render() {
		const { carouselIndex, crop, cropRemainder, oneItem, autoPlayToggle } = this.state;
		const props = Object.assign({}, this.props);
		props.customFields.textHorizontalAlignment = 'center';
		props.customFields.textVerticalAlignment = 'bottom';
		return (
			<div className="full-bleed">
				<Carousel
					{...props}
					autoPlayToggle={autoPlayToggle}
					onAutoPlayingChange={this.onAutoPlayingChange}
					desktopImageSize={'wallpaper'}
					mobileImageSize={'wallpaper'}
					items={this.onItems}
					className={cx(!oneItem ? bemCarousel.b('h5', { crop: crop }) : '', crop ? bemCarousel.b('height') : '')}
					scrollTo={carouselIndex}
					itemIndex={this.onItemIndex}
					style={crop ? { height: `${cropRemainder}px` } : {}}
					onRef={this.onCarouselRef}
					transitionDisabled={this.onTransitionDisabledState}
					itemTransitionsDisabled={true}
					scrollToEnabled={true}
				>
					{!oneItem ? this.renderRowCarousel() : false}
				</Carousel>
			</div>
		);
	}

	renderRowCarousel = () => {
		const { items, rowCarouselIndex } = this.state;
		return (
			<div className={cx(bemH5Navigation.b())}>
				<div className={bemH5Navigation.e('item-list')}>
					<RowCarousel
						itemWidthPerc={16.9}
						itemIndex={rowCarouselIndex}
						items={items}
						childRenderTemplate={this.renderRowCarouselItem}
						rightMargin={2}
						onTransition={this.onRowCarouselTransition}
					/>
					<div className={bemH5Navigation.e('icon-wrapper')}>
						<button onClick={this.scroll} className={bemH5Navigation.e('button')}>
							<SVGPathIcon
								className={cx('svg-icon', bemH5Navigation.e('icon'))}
								data={'M3 3 L15 14 L27 3'}
								viewBox={{ width: 27, height: 18 }}
								fill="transparent"
								stroke="white"
								width={27}
								height={18}
							/>
						</button>
					</div>
				</div>
			</div>
		);
	};

	renderRowCarouselItem = (item, i) => {
		return (
			<a
				onClick={e => {
					e.preventDefault();
					this.transitionCarousel(item.item.id);
				}}
				href="#"
				title={item.item.title}
				className={bemH5Navigation.e('link', {
					focused: i === this.state.rowCarouselIndex
				})}
				key={item.item.id}
			>
				<div className={bemH5Navigation.e('image-wrapper')}>
					<Picture
						src={item.sources[0].src}
						sources={item.sources}
						className={bemH5Navigation.e('image')}
						description={item.item.title}
					/>
				</div>
			</a>
		);
	};
}
