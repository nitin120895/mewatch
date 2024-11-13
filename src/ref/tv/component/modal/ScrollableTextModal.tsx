import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove, skipMove, transform } from 'ref/tv/util/focusUtil';
import { resolveAlignment } from 'ref/tv/util/itemUtils';
import EdHtml from 'ref/tv/pageEntry/editorial/EdHtml';
import sass from 'ref/tv/util/sass';
import './ScrollableTextModal.scss';

const bem = new Bem('scrollable-text');

interface ScrollableTextModalProps extends React.HTMLProps<any> {
	text: string;
	textWrap?: boolean;
	customFields?: any;
	title?: string;
}

export default class ScrollableTextModal extends React.Component<ScrollableTextModalProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;
	private ref: HTMLElement;
	private refTitle: HTMLElement;
	private refContent: HTMLElement;

	constructor(props: ScrollableTextModalProps) {
		super(props);

		this.state = {
			transY: 0,
			containerHeight: 0
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: skipMove
		};
	}

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);

		if (this.props.title) {
			this.setState({
				containerHeight: this.ref.clientHeight - sass.scrollableTextModalPadding * 2 - this.refTitle.clientHeight
			});
		} else {
			this.setState({ containerHeight: this.ref.clientHeight - sass.scrollableTextModalPadding * 2 });
		}
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveUp = (): boolean => {
		let { transY } = this.state;

		if (transY === 0) return true;

		transY += sass.scrollablePageSize;
		transY = Math.min(transY, 0);
		this.setState({
			transY
		});

		return true;
	};

	private moveDown = (): boolean => {
		let { transY } = this.state;
		const { containerHeight } = this.state;
		const minTrans = -this.refContent.clientHeight + containerHeight;

		if (this.refContent.clientHeight < containerHeight) {
			return true;
		}

		if (transY === minTrans) return true;

		transY -= sass.scrollablePageSize;
		transY = Math.max(transY, minTrans);
		this.setState({
			transY
		});

		return true;
	};

	private onReference = ref => {
		this.ref = ref;
	};

	private onRefTitle = ref => {
		this.refTitle = ref;
	};

	private onRefContent = ref => {
		this.refContent = ref;
	};

	render(): any {
		const { text, textWrap, customFields, title } = this.props;
		const { transY, containerHeight } = this.state;
		const contentTransform = transform(
			transY + 'px',
			(sass.transitionDuration * 2) / 3,
			0,
			true,
			customFields && customFields.textColor
				? { color: customFields.textColor.color, opacity: customFields.textColor.opacity / 100 }
				: undefined
		);
		const clientHeight = this.refContent ? this.refContent.clientHeight : 0;
		const cursorTransform = transform(
			(transY / (-clientHeight + containerHeight)) * (containerHeight - sass.scrollableTextModalScrollBarHeight) + 'px',
			(sass.transitionDuration * 2) / 3,
			0,
			true
		);
		const renderScrollBar = clientHeight >= containerHeight;

		return (
			<div className={bem.b()} ref={this.onReference}>
				{title && (
					<div className={bem.e('title')} ref={this.onRefTitle}>
						{title}
					</div>
				)}
				<div className={bem.e('container')} style={{ height: containerHeight + 'px' }}>
					<div
						className={bem.e('content', resolveAlignment(customFields && customFields.textHorizontalAlignment))}
						style={contentTransform}
						ref={this.onRefContent}
					>
						<EdHtml innerHTML={text} textWrap={textWrap} />
					</div>
					{renderScrollBar && (
						<div className={bem.e('scrollbar')}>
							<div className={bem.e('cursor')} style={cursorTransform} />
						</div>
					)}
				</div>
			</div>
		);
	}
}
