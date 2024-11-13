import * as React from 'react';
import * as PropTypes from 'prop-types';
import Image from 'shared/component/Image';
import EntryTitle from 'ref/tv/component/EntryTitle';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { resolveImage } from 'shared/util/images';
import { resolveAlignment } from 'ref/tv/util/itemUtils';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { Bem } from 'shared/util/styles';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import { getImageData } from 'ref/tv/util/itemUtils';
import './Ed1Image.scss';

const bem = new Bem('ed1');

export default class Ed1Image extends React.Component<PageEntryImageProps, any> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
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

	componentWillMount() {
		const { images, customFields } = this.props;
		const image = this.getImageInfo(images, customFields);

		if (!customFields.link && (image.height * 100) / sass.viewportHeight < 40) {
			this.focusableRow.focusable = false;
		}
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		const { images, customFields } = this.props;
		const image = this.getImageInfo(images, customFields);

		if (!customFields.link && (image.height * 100) / sass.viewportHeight < 40) {
			this.setState({
				isFocused: false
			});

			return false;
		}

		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private exec = (act?: string): boolean => {
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

	private getImageInfo = (images: any, customFields: any): image.Resource => {
		let option: image.Options = {};
		let imageWidth;
		switch (customFields.imageWidth) {
			case 'fullWidth':
				imageWidth = sass.viewportWidth;
				break;
			case 'contentWidth':
				imageWidth = sass.contentWidth;
				break;
			case 'widthPercentage':
				if (customFields.widthPercentage) {
					imageWidth = (sass.viewportWidth * customFields.widthPercentage) / 100;
				} else {
					imageWidth = sass.contentWidth;
				}
				break;
			default:
				imageWidth = sass.viewportWidth;
				break;
		}

		option.width = imageWidth;
		const imageType = Object.keys(images)[0];
		if (imageType === 'custom') {
			option.format = 'png';
		}

		const image = resolveImage(images, imageType as any, option);

		return image;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setState({
			isFocused: false
		});
	};

	private handleClick = () => {
		const { customFields } = this.props;

		if (customFields.link) {
			this.context.router.push(customFields.link);
		}
	};

	render(): any {
		const { images, customFields } = this.props;
		const image = this.getImageInfo(images, customFields);

		return (
			<div className={bem.b(customFields.imageVerticalSpacing)} ref={ref => (this.ref = ref)}>
				<EntryTitle {...this.props} />
				<div
					className={bem.e('background', [
						resolveAlignment(customFields.imageHorizontalAlignment),
						customFields.imageWidth,
						customFields.imageVerticalSpacing
					])}
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
				>
					<div className={bem.e('image-container')} onClick={this.handleClick}>
						<div className={bem.e('image-content', { focused: this.state.isFocused })}>
							<Image
								className={bem.e('image', { focused: this.state.isFocused })}
								src={image.src}
								height={image.height}
								width={image.width}
							/>
						</div>
						{customFields.caption && (
							<div className={bem.e('caption', customFields.imageVerticalSpacing)}>{customFields.caption}</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}
