import * as React from 'react';
import Picture from 'shared/component/Picture';
import * as PropTypes from 'prop-types';
import { resolveImages } from 'shared/util/images';
import { resolveAlignment, resolveColor, fullScreenWidth } from '../../../util/itemUtils';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { setPaddingStyle } from 'ref/tv/util/rows';
import { getImageData } from 'ref/tv/util/itemUtils';
import './H9Image.scss';

const desktopBp = `(min-width: ${fullScreenWidth}px and max-width: ${fullScreenWidth})`;

const bem = new Bem('h9');

type ImageLayoutPosition = 'fullWidth' | 'widthPercentage' | 'contentWidth';

interface H9ImageCustomFields {
	imageText?: string;
	imageWidth?: ImageLayoutPosition;
	imageHorizontalAlignment?: position.AlignX;
	textHorizontalAlignment?: position.AlignX;
	textVerticalAlignment?: position.AlignY;
	textColor: customFields.Color;
	widthPercentage?: number;
}

export default class H9Image extends React.Component<PageEntryImageProps, any> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private title: HTMLElement;
	private container: HTMLElement;
	private focusableRow: Focusable;

	constructor(props) {
		super(props);

		this.state = this.getDefaultState(props);

		this.focusableRow = {
			focusable: true,
			index: 10,
			dynamicHeight: true,
			height: 1,
			template: props.template,
			entryProps: props,
			entryImageDetails: getImageData(props.images, Object.keys(props.images)[0]),
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	private setFocus = (isFocused?: boolean): boolean => {
		this.setState({ focused: isFocused });
		return true;
	};

	private exec = (act?: string) => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
			default:
				break;
		}

		return false;
	};

	private invokeItem = () => {
		const { customFields } = this.props;

		if (customFields.link) {
			this.context.router.push(customFields.link);
		} else {
			this.context.focusNav.focusNextRow(this.focusableRow.index);
		}
	};

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.container;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.container;

		this.context.focusNav.registerRow(this.focusableRow);
		this.updateStyles();
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentWillUpdate(nextProps: PageEntryImageProps, nextState: any) {
		if (this.props.images !== nextProps.images) {
			this.setState(this.getDefaultState(nextProps));
		}
	}

	componentDidUpdate(prevProps: PageEntryImageProps, prevState: any) {
		if (this.props.customFields !== prevProps.customFields) {
			this.updateStyles();
		}
	}

	private getDefaultState(props: PageEntryImageProps) {
		const images = props.images;
		let imageType: image.Type;
		let option: image.Options = {};
		const breakpoints = {
			desktopWide: undefined
		};

		let types = [];
		if (images) {
			for (let key in images) {
				if (images.hasOwnProperty(key)) {
					types.push(key);
				}
			}
		}

		if (types.length > 0) {
			option.width = fullScreenWidth;
			imageType = types[0] as image.Type;
			if (imageType === 'custom') {
				option.format = 'png';
			}

			breakpoints.desktopWide = resolveImages(images, imageType, option)[0].src;
		}

		return { images: breakpoints, imageType, focused: false };
	}

	private getCustomFields = () => {
		return this.props.customFields as H9ImageCustomFields;
	};

	private updateStyles() {
		const custom = this.getCustomFields();
		const hasTitle = !!(this.title && custom.imageText);
		if (this.container) {
			const { imageWidth, widthPercentage, imageHorizontalAlignment } = custom;
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
		if (hasTitle) {
			this.title.style.color = resolveColor(custom.textColor, '#fff');
		}
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onTitleRef = (ref: HTMLElement) => {
		this.title = ref;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private handleMouseClick = () => {
		const { customFields } = this.props;

		if (customFields.link) {
			this.context.router.push(customFields.link);
		}
	};

	render() {
		const { imageWidth } = this.getCustomFields();
		const { imageType, focused } = this.state;
		const classes = cx(bem.b(imageType, imageWidth !== 'fullWidth' ? 'percent' : undefined), {
			'full-bleed': imageWidth === 'fullWidth',
			focused
		});

		return (
			<div
				className={classes}
				ref={this.onContainerRef}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleMouseClick}
			>
				{this.renderImage()}
				{this.renderTitle()}
				{focused && <div className={bem.e('focus-underline')} />}
			</div>
		);
	}

	private renderImage = () => {
		const { images } = this.state;
		const sources = [{ src: images.desktopWide, mediaQuery: desktopBp }];
		const { imageHorizontalAlignment } = this.getCustomFields();
		const alignment = resolveAlignment(imageHorizontalAlignment);

		return (
			<div className={bem.e('ap', { left: alignment === 'left' })}>
				<Picture className={bem.e('picture')} src={sources[0].src} sources={sources} />
			</div>
		);
	};

	private renderTitle = () => {
		const custom = this.props.customFields as H9ImageCustomFields;
		const { imageText, imageWidth, textHorizontalAlignment: hAlign, textVerticalAlignment: vAlign } = custom;
		const classes = cx(bem.e('text', hAlign || 'left', vAlign || 'middle'), `txt-${resolveAlignment(hAlign)}`, {
			'grid-margin': imageWidth === 'fullWidth'
		});

		return (
			imageText && (
				<h1 className={classes} ref={this.onTitleRef}>
					{imageText}
				</h1>
			)
		);
	};
}
