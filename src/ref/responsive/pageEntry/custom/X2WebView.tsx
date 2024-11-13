import * as React from 'react';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { Bem } from 'shared/util/styles';
import { resolveVerticalSpacingClassNames } from '../util/custom';
import { X2WebView as TemplateKey } from 'shared/page/pageEntryTemplate';
import * as cx from 'classnames';

import './X2WebView.scss';

interface CustomFields {
	link?: string;
	widthPercentage?: number;
	imageWidth?: customFields.ImageLayoutPosition;
	imageHorizontalAlignment?: position.AlignX;
	imageVerticalSpacing?: customFields.ImageVerticalSpacing;
	aspectRatio?: customFields.AspectRatio;
	pixelHeight?: number;
	customTagline?: string;
}

export interface X2PageEntryProps extends TPageEntryPropsBase<CustomFields> {
	// These properties aren't utilised by scheduled X2 page entries, but are optionally
	// utilised by scheduled X3 page entries which instantiate an X2 instance.
	height?: number;
	onLinkChange?: () => void;
}

const bemX2 = new Bem('x2');
const bemCfVspacing = new Bem('cf-vspacing');
const bemSfAp = new Bem('cf-ap');

export default class X2WebView extends React.Component<X2PageEntryProps, any> {
	private container: HTMLElement;

	constructor(props: X2PageEntryProps) {
		super(props);
	}

	componentDidMount() {
		this.updateStyles();

		const iframe = this.container.querySelector('iframe');
		iframe.setAttribute('allow', 'encrypted-media');
	}

	componentWillReceiveProps(nextProps: X2PageEntryProps) {
		const { customFields, height } = this.props;
		const { customFields: nextCustomFields, onLinkChange } = nextProps;
		if (customFields && nextCustomFields) {
			if (customFields.link !== nextCustomFields.link) {
				if (height > 0) {
					// Clear existing props height prior to rendering new props
					/* tslint:disable:no-null-keyword */
					this.container.style.height = null;
					/* tslint:enable */
				}
				if (onLinkChange) onLinkChange();
			}
		}
	}

	componentDidUpdate(prevProps: X2PageEntryProps, prevState: any) {
		const { customFields, height } = this.props;
		const { customFields: prevCustomFields, height: prevHeight } = prevProps;
		if (customFields !== prevCustomFields || height !== prevHeight) {
			this.updateStyles();
		}
	}

	private getVerticalSpacing() {
		const { imageVerticalSpacing } = this.props.customFields;
		return resolveVerticalSpacingClassNames(imageVerticalSpacing);
	}

	private updateStyles() {
		if (this.container) {
			const { height: propsHeight } = this.props;
			const {
				imageWidth,
				widthPercentage,
				imageHorizontalAlignment,
				aspectRatio,
				pixelHeight
			} = this.props.customFields;
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
			if (aspectRatio === 'pixels') {
				this.container.style.height = `${pixelHeight}px`;
			} else {
				this.container.style.height = null;
			}
			/* tslint:enable */
			if (propsHeight > 0) {
				this.container.style.height = `${propsHeight}px`;
			}
		}
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	render() {
		const { template, height: propsHeight, customFields, className } = this.props;
		const hasExternalHeight = propsHeight > 0;
		const isFullWidth = customFields.imageWidth === 'fullWidth';
		const verticalSpacingModifier = this.getVerticalSpacing();
		const displayEntryTitle = !~verticalSpacingModifier.indexOf('flush-top');
		const templateName = template !== TemplateKey ? template.toLowerCase() : '';
		const classes = cx(
			bemX2.b(),
			!hasExternalHeight ? bemCfVspacing.b(verticalSpacingModifier) : '',
			templateName,
			className
		);
		const iFrameJsx = this.renderIframe(hasExternalHeight, customFields, templateName);
		return (
			<div className={classes}>
				{displayEntryTitle && <EntryTitle {...this.props} />}
				{isFullWidth ? <div className="full-bleed">{iFrameJsx}</div> : iFrameJsx}
			</div>
		);
	}

	renderIframe(hasExternalHeight, customFields, templateName) {
		const { link, aspectRatio } = customFields;
		const fixedHeight = aspectRatio === 'pixels';
		const iFrameClasses = cx(bemX2.e('frame'), fixedHeight || hasExternalHeight ? undefined : bemSfAp.b(aspectRatio));
		return (
			<div className={iFrameClasses} ref={this.onContainerRef}>
				<iframe
					className="x2-iframe"
					src={link}
					frameBorder={0}
					allowFullScreen={true}
					name={templateName || 'x2'}
					scrolling="yes"
				/>
			</div>
		);
	}
}
