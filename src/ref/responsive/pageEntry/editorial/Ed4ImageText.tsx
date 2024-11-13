import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { resolveImages } from 'shared/util/images';
import Picture from 'shared/component/Picture';
import { BREAKPOINT_RANGES } from 'ref/responsive/util/grid';
import { resolveColor } from 'ref/responsive/pageEntry/util/custom';

import './Ed4ImageText.scss';

const tabletBreakpoint = BREAKPOINT_RANGES['phablet'];
const desktopBreakpoint = BREAKPOINT_RANGES['desktop'];

const mobileBp = `(max-width: ${tabletBreakpoint.min - 1}px)`;
const tabletBp = `(min-width: ${tabletBreakpoint.min}px) and (max-width: ${desktopBreakpoint.min - 1}px)`;
const desktopBp = `(min-width: ${desktopBreakpoint.min}px)`;

const bem = new Bem('ed4');

export default class Ed4ImageText extends React.Component<PageEntryImageProps, any> {
	private textContent: HTMLElement;

	constructor(props) {
		super(props);
		this.state = this.getDefaultState(props);
	}

	componentDidMount() {
		this.updateTextColor(this.props);
	}

	componentWillUpdate(nextProps: PageEntryImageProps, nextState: any) {
		if (this.props.images !== nextProps.images) {
			this.setState(this.getDefaultState(nextProps));
		}
		if (this.props.customFields.textColor !== nextProps.customFields.textColor) {
			this.setState(this.updateTextColor(nextProps));
		}
	}

	private getDefaultState(props: PageEntryImageProps) {
		const images = props.images;
		const hasImage = ~Object.keys(images || {}).indexOf('tile');
		if (!images || !hasImage) return { images: undefined };

		/*
		 * On mobile screens, the image will occupy the full width of the viewport.
		 * However, from tablet onwards, the image will only stretch to 50% of the viewport width.
		 */
		const breakpoints = {
			mobile: resolveImages(images, 'tile', { width: 480 })[0].src,
			tablet: resolveImages(images, 'tile', { width: 600 })[0].src,
			desktopWide: resolveImages(images, 'tile', { width: 1200 })[0].src
		};
		return {
			images: breakpoints
		};
	}

	private updateTextColor(props) {
		const color = resolveColor(props.customFields.textColor, '#fff', true);
		this.textContent.style.color = color;
		return { color };
	}

	private onTextContentReference = node => (this.textContent = node);

	render() {
		if (!this.props.customFields) return false;
		const { imageHorizontalAlignment } = this.props.customFields;
		return (
			<div className={cx(bem.b({ right: imageHorizontalAlignment === 'right' }), 'full-bleed')}>
				{this.renderPicture()}
				{this.renderTextContent()}
			</div>
		);
	}

	private renderPicture() {
		const { images } = this.state;
		if (!images) return false;
		const sources = [
			{ src: images.mobile, mediaQuery: mobileBp },
			{ src: images.tablet, mediaQuery: tabletBp },
			{ src: images.desktopWide, mediaQuery: desktopBp }
		];
		return (
			<Picture className={bem.e('img')} imageClassName={bem.e('fallback')} src={sources[1].src} sources={sources} />
		);
	}

	private renderTextContent() {
		if (!this.props.customFields) return false;
		const { title, description, textHorizontalAlignment } = this.props.customFields;
		return (
			<div className={bem.e('content')}>
				<div
					className={bem.e('text', { right: textHorizontalAlignment === 'right' })}
					ref={this.onTextContentReference}
				>
					{title && <h3 className={bem.e('heading')}>{title}</h3>}
					{description && <p className={bem.e('description')}>{description}</p>}
				</div>
			</div>
		);
	}
}
