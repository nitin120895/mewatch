import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { resolveAlignment, resolveVerticalSpacingClassNames } from 'ref/responsive/pageEntry/util/custom';
import { transparencyHack } from 'ref/responsive/pageEntry/util/ibc';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { MixpanelEntryPoint } from 'shared/analytics/mixpanel/util';
import Picture from 'shared/component/Picture';
import { Ed1Image as template } from 'shared/page/pageEntryTemplate';
import { UPDATE_SUBSCRIPTION_ENTRY_POINT } from 'shared/page/pageWorkflow';
import { browserHistory } from 'shared/util/browserHistory';
import { resolveImages } from 'shared/util/images';
import { Bem } from 'shared/util/styles';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import './Ed1Image.scss';

const phabletBreakpoint = BREAKPOINT_RANGES['phablet'];
const desktopWideBreakpoint = BREAKPOINT_RANGES['desktopWide'];
const uhdBreakpoint = BREAKPOINT_RANGES['uhd'];

const mobileBp = `(max-width: ${phabletBreakpoint.min - 1}px)`;
const tabletBp = `(min-width: ${phabletBreakpoint.min}px) and (max-width: ${phabletBreakpoint.max}px)`;
const desktopBp = `(min-width: ${phabletBreakpoint.max + 1}px) and (max-width: ${desktopWideBreakpoint.min - 1}px)`;
const desktopWideBp = `(min-width: ${desktopWideBreakpoint.min}px) and (max-width: ${uhdBreakpoint.min - 1}px)`;
const uhdBp = `(min-width: ${uhdBreakpoint.min}px)`;

const bemEd1 = new Bem('ed1');
const bemCfVspacing = new Bem('cf-vspacing');
const bemImage = new Bem('ed1-img');

interface CustomFields {
	altText?: string;
	caption?: string;
	customTagline?: string;
	imageWidth?: customFields.ImageLayoutPosition;
	imageHorizontalAlignment?: position.AlignX;
	imageVerticalSpacing?: customFields.ImageVerticalSpacing;
	link?: string;
	widthPercentage?: number;
}

interface DispatchProps {
	updateSubscriptionEntryPoint: (entryPoint) => void;
}

type Ed1PageEntryProps = TPageEntryImageProps<CustomFields> & DispatchProps;

class Ed1Image extends React.Component<Ed1PageEntryProps, any> {
	private container: HTMLElement;

	constructor(props) {
		super(props);
		this.state = this.getDefaultState(props);
	}

	componentDidMount() {
		this.updateStyles();
	}

	componentWillUpdate(nextProps: Ed1PageEntryProps, nextState: any) {
		if (this.props.images !== nextProps.images) {
			this.setState(this.getDefaultState(nextProps));
		}
	}

	componentDidUpdate(prevProps: Ed1PageEntryProps, prevState: any) {
		if (this.props.customFields !== prevProps.customFields) {
			this.updateStyles();
		}
	}

	private getDefaultState(props: PageEntryImageProps) {
		const images = props.images;
		const types = Object.keys(images || {});
		let imageType: image.Type = undefined;
		const breakpoints = {
			mobile: undefined,
			tablet: undefined,
			desktop: undefined,
			desktopWide: undefined,
			uhd: undefined
		};
		if (types.length > 0) {
			imageType = types[0] as image.Type;
			const options = transparencyHack(imageType);
			// We set a higher than usual quality for editorial images to ensure they're crisp
			options.quality = 0.94;
			breakpoints.mobile = resolveImages(images, imageType as any, { width: 420, ...options })[0].src;
			breakpoints.tablet = resolveImages(images, imageType as any, { width: 640, ...options })[0].src;
			breakpoints.desktop = resolveImages(images, imageType as any, { width: 1200, ...options })[0].src;
			breakpoints.desktopWide = resolveImages(images, imageType as any, { width: 1680, ...options })[0].src;
			breakpoints.uhd = resolveImages(images, imageType as any, { width: 2880, ...options })[0].src;
		}

		return { images: breakpoints, imageType };
	}

	private updateStyles() {
		if (this.container) {
			const { imageWidth, widthPercentage, imageHorizontalAlignment } = this.props.customFields;
			/* tslint:disable:no-null-keyword */
			if (imageWidth === 'widthPercentage') {
				this.container.style.width = `${widthPercentage}%`;
				let offset = 0;
				switch (imageHorizontalAlignment) {
					case 'left':
						offset = 0;
						break;
					case 'center':
						offset = (100 - widthPercentage) / 2;
						break;
					case 'right':
						offset = offset = 100 - widthPercentage;
						break;
				}
				this.container.style.right = offset ? `-${offset}%` : null;
			} else {
				this.container.style.width = null;
				this.container.style.right = null;
			}
			/* tslint:enable */
		}
	}

	private getVerticalSpacing() {
		const { imageVerticalSpacing } = this.props.customFields;
		return resolveVerticalSpacingClassNames(imageVerticalSpacing);
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	render() {
		const { imageWidth, caption } = this.props.customFields;
		const isFullWidth = imageWidth === 'fullWidth';
		const imageClasses = cx(bemImage.b(), { 'full-bleed': isFullWidth });
		const verticalSpacingModifier = this.getVerticalSpacing();
		const shouldDisplayEntryTitle = !~verticalSpacingModifier.indexOf('flush-top');
		const shouldDisplayCaption = !!caption && !~verticalSpacingModifier.indexOf('flush-bottom');
		return (
			<div className={cx(bemEd1.b(), bemCfVspacing.b(verticalSpacingModifier))}>
				{shouldDisplayEntryTitle && <EntryTitle {...this.props} />}
				<div className={imageClasses} ref={this.onContainerRef}>
					{this.renderImage()}
					{shouldDisplayCaption && <p className={bemEd1.e('caption')}>{caption}</p>}
				</div>
			</div>
		);
	}

	onClickImage = link => {
		const { updateSubscriptionEntryPoint } = this.props;
		updateSubscriptionEntryPoint(MixpanelEntryPoint.Banner);
		if (link.startsWith('/')) {
			browserHistory.push(link);
		} else {
			window.location.href = link;
		}
	};

	private renderImage = () => {
		const { imageHorizontalAlignment, link } = this.props.customFields;
		const horizontalAlignment = resolveAlignment(imageHorizontalAlignment);
		const picture = !!link ? (
			<a onClick={() => this.onClickImage(link)} className={bemImage.e('overlay-wrapper')}>
				<div className={bemImage.e('overlay')} />
				{this.renderPicture()}
			</a>
		) : (
			this.renderPicture()
		);
		return <div className={bemImage.e('ap', { left: horizontalAlignment === 'left' })}>{picture}</div>;
	};

	private renderPicture() {
		const { altText } = this.props.customFields;
		const { images } = this.state;
		const sources = [
			{ src: images.mobile, mediaQuery: mobileBp },
			{ src: images.tablet, mediaQuery: tabletBp },
			{ src: images.desktop, mediaQuery: desktopBp },
			{ src: images.desktopWide, mediaQuery: desktopWideBp },
			{ src: images.uhd, mediaQuery: uhdBp }
		];
		return <Picture className="ed1-picture" src={sources[1].src} sources={sources} description={altText} />;
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		updateSubscriptionEntryPoint: payload => dispatch({ type: UPDATE_SUBSCRIPTION_ENTRY_POINT, payload: payload })
	};
}

const A4Profiles = connect<any, DispatchProps, PageEntryImageProps>(
	undefined,
	mapDispatchToProps
)(Ed1Image);

// Need to set the template name to the connected component, because redux-connect creates a new class as HOC
(A4Profiles as any).template = template;
export default A4Profiles;
