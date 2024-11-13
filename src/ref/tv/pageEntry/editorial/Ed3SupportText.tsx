import * as React from 'react';
import * as PropTypes from 'prop-types';
import { resolveAlignment } from 'ref/tv/util/itemUtils';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { transform } from 'ref/tv/util/focusUtil';
import { Bem } from 'shared/util/styles';
import EdHtml from './EdHtml';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import './Ed3SupportText.scss';

const bem = new Bem('ed3');

interface Ed3CustomFields {
	textColor?: customFields.Color;
	textHorizontalAlignment?: position.AlignX;
}

export default class Ed3SupportText extends React.Component<PageEntryTextProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private refContent: HTMLElement;
	private bodyHeight: number = document.getElementById('root').clientHeight;
	private contentHeight: number = this.bodyHeight - sass.itemMargin * 2;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false,
			transY: 0
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			dynamicHeight: true,
			height: 1,
			template: props.template,
			transY: 0,
			entryProps: props,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: skipMove
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

	private restoreSavedState = (savedState: any) => {
		if (savedState && savedState.transY !== undefined) {
			this.setState({
				transY: savedState.transY
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private moveUp = (): boolean => {
		let { transY } = this.state;
		if (transY === 0) return false;

		transY += sass.scrollablePageSize;
		transY = Math.min(transY, 0);

		this.focusableRow.transY = transY;
		this.setState({
			transY
		});

		return true;
	};

	private moveDown = (): boolean => {
		if (this.refContent.clientHeight <= this.contentHeight) {
			return false;
		}

		const maxTrans = this.refContent.clientHeight - this.contentHeight;
		let { transY } = this.state;
		if (transY === -maxTrans) return false;

		transY -= sass.scrollablePageSize;
		transY = -Math.min(Math.abs(transY), maxTrans);

		this.focusableRow.transY = transY;
		this.setState({
			transY
		});

		return true;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	render(): any {
		if (this.contentHeight > sass.viewportHeight) this.contentHeight = sass.viewportHeight;

		const { text, customFields } = this.props;
		const { transY, isFocused } = this.state;
		const custom = (customFields || {}) as Ed3CustomFields;
		const contentTransform = transform(
			transY + 'px',
			(sass.transitionDuration * 2) / 3,
			0,
			true,
			custom.textColor ? { color: custom.textColor.color, opacity: custom.textColor.opacity / 100 } : undefined
		);
		const clientHeight = this.refContent ? this.refContent.clientHeight : 0;
		const cursorTransform = transform(
			(Math.abs(transY) / clientHeight) * this.contentHeight + 'px',
			(sass.transitionDuration * 2) / 3,
			0,
			true
		);
		const renderScrollBar = isFocused && clientHeight >= this.contentHeight;

		return (
			<div
				className={bem.b()}
				ref={ref => (this.ref = ref)}
				style={{ height: this.contentHeight + 'px' }}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
			>
				<div
					className={bem.e('content', resolveAlignment(custom.textHorizontalAlignment))}
					style={contentTransform}
					ref={ref => (this.refContent = ref)}
				>
					<EdHtml innerHTML={text} />
				</div>

				{renderScrollBar && (
					<div className={bem.e('scrollbar')} style={{ height: this.contentHeight + 'px' }}>
						<div
							className={bem.e('cursor')}
							style={Object.assign(
								{
									height: (this.contentHeight / clientHeight) * this.contentHeight + 'px'
								},
								cursorTransform
							)}
						/>
					</div>
				)}
			</div>
		);
	}
}
