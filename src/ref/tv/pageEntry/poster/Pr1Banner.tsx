import * as React from 'react';
import * as PropTypes from 'prop-types';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { Bem } from 'shared/util/styles';
import { resolveImages, convertResourceToSrcSet, fallbackURI } from 'shared/util/images';
import Image from 'shared/component/Image';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import { getImageData } from 'ref/tv/util/itemUtils';
import './Pr1Banner.scss';

const bem = new Bem('pr1');

export default class Pr1Banner extends React.Component<PageEntryItemProps, any> {
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
			entryImageDetails: getImageData(props.item.images, 'hero7x1'),
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
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
		if (this.state.isFocused !== isFocus) {
			if (isFocus) {
				this.context.focusNav.analytics.triggerItemEvents(
					'MOUSEENTER',
					this.props.item,
					this.props as any,
					0,
					'hero7x1',
					this.focusableRow.entryImageDetails
				);
			} else {
				this.context.focusNav.analytics.triggerItemEvents(
					'MOUSELEAVE',
					this.props.item,
					this.props as any,
					0,
					'hero7x1',
					this.focusableRow.entryImageDetails
				);
			}

			this.setState({ isFocused: isFocus });
		}

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
		this.context.focusNav.analytics.triggerItemEvents(
			'CLICK',
			this.props.item,
			this.props as any,
			0,
			'hero7x1',
			this.focusableRow.entryImageDetails
		);
		this.context.router.push(this.props.item.path);
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private handleClick = () => {
		this.invokeItem();
	};

	render(): any {
		const images = resolveImages(this.props.item.images, 'hero7x1', { width: sass.pr1Width });
		const sources = images.map(source => convertResourceToSrcSet(source, true));
		const defaultImage = images[0];
		const displayWidth = defaultImage.displayWidth ? defaultImage.displayWidth : defaultImage.width;
		const displayHeight = defaultImage.displayHeight ? defaultImage.displayHeight : defaultImage.height;
		const hasImage = sources[0].url !== fallbackURI;
		const rowHeight = hasImage ? '' : displayHeight;

		return (
			<div
				className={bem.b()}
				style={{ height: rowHeight }}
				ref={ref => (this.ref = ref)}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleClick}
			>
				<Image
					className={bem.e('image', { focused: this.state.isFocused }, hasImage ? '' : 'full-size')}
					srcSet={sources}
					width={displayWidth}
					height={displayHeight}
				/>
			</div>
		);
	}
}
