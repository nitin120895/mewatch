import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import IntlFormatter from './IntlFormatter';
import { KEY_CODE } from 'shared/util/keycodes';
import { Bem } from 'shared/util/styles';
import { connect } from 'react-redux';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';

import './CollapsibleContainer.scss';

export interface CollapsibleContainerProps extends React.Props<any> {
	tagName?: string;
	className?: string;
	focusable?: string;
	maxHeight?: string;
	ariaLabel?: string;
	renderExpanded?: () => any;
	onExpand?: () => any;
	updateOnResize?: boolean;
	onShowModal?: (config: ModalConfig) => void;
}

interface CollapsibleContainerState {
	hasOverflow?: boolean;
	maxHeight?: string;
	expanded?: boolean;
}

const bem = new Bem('collapsible-container');

/**
 * Generic container which applies a fade to black overlay to indicate collapsed overflowing content.
 *
 * This container can either have the maxHeight passed through props or `max-height` set via css.
 * When the children overflow this container it can be clicked to expand and reveal the full content
 * if the `renderExpanded` prop is provided a modal will be rendered with a custom body instead of
 * expanding out the container to full height.
 */
class CollapsibleContainer extends React.PureComponent<CollapsibleContainerProps, CollapsibleContainerState> {
	static defaultProps = {
		tagName: 'div',
		ariaLabel: '@{collapsibleContainer_expand_aria|Expand}',
		focusable: true,
		updateOnResize: true
	};

	private container: HTMLElement;
	private hasResizeListener = false;

	constructor(props) {
		super(props);
		this.state = {
			expanded: false,
			hasOverflow: false
		};
	}

	componentDidMount() {
		this.updateOverflow();
		this.toggleResizeListener(this.props.updateOnResize);
	}

	componentWillReceiveProps(nextProps: CollapsibleContainerProps) {
		this.toggleResizeListener(nextProps.updateOnResize);
	}

	componentDidUpdate() {
		this.updateOverflow();
	}

	componentWillUnmount() {
		this.toggleResizeListener(false);
	}

	private toggleResizeListener(active: boolean) {
		if (active === this.hasResizeListener) return;
		this.hasResizeListener = active;
		if (active) {
			window.addEventListener('resize', this.updateOverflow);
		} else {
			window.removeEventListener('resize', this.updateOverflow);
		}
	}

	private updateOverflow = () => {
		if (!this.container) return;
		const { expanded } = this.state;
		const { maxHeight, renderExpanded } = this.props;
		const scrollHeight = this.container.scrollHeight;
		this.setState({
			maxHeight: expanded && !renderExpanded ? scrollHeight + 'px' : maxHeight,
			hasOverflow: scrollHeight > this.container.clientHeight
		});
	};

	private onReference = ref => {
		this.container = ref ? findDOMNode<HTMLElement>(ref) : undefined;
	};

	private onKeyDown = (e: React.KeyboardEvent<any>) => {
		if (e.keyCode === KEY_CODE.ENTER) {
			e.preventDefault();
			this.showExpanded();
		}
	};

	private onClick = () => {
		if (this.props.onExpand) {
			this.props.onExpand();
		} else {
			this.showExpanded();
		}
	};

	private showExpanded() {
		const { onShowModal, renderExpanded } = this.props;
		if (renderExpanded) {
			onShowModal({
				id: 'expanded',
				type: ModalTypes.STANDARD_DIALOG,
				componentProps: {
					children: renderExpanded(),
					className: bem.e('modal')
				}
			});
		} else {
			this.setState({ expanded: true });
		}
	}

	render() {
		const { className, ariaLabel, tagName, children, focusable, renderExpanded } = this.props;
		const { expanded, hasOverflow, maxHeight } = this.state;
		const collapsed = hasOverflow && (!expanded || !!renderExpanded);
		const onClick = focusable && hasOverflow && !expanded ? this.onClick : undefined;
		const blockClasses = bem.b({ collapsed });
		const classes = cx(blockClasses, className);
		return (
			<IntlFormatter
				elementType={tagName}
				ref={this.onReference}
				className={classes}
				onKeyDown={onClick ? this.onKeyDown : undefined}
				onClick={onClick}
				style={maxHeight ? { maxHeight } : undefined}
				role={onClick ? 'button' : undefined}
				aria-hidden={focusable ? undefined : true}
				tabIndex={onClick ? 0 : -1}
				formattedProps={onClick ? { 'aria-label': ariaLabel } : undefined}
			>
				{children}
			</IntlFormatter>
		);
	}
}

const actions = {
	onShowModal: OpenModal
};

export default connect<any, any, CollapsibleContainerProps>(
	undefined,
	actions
)(CollapsibleContainer);
