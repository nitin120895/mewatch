import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

export const bem = new Bem('floating-scrollable');

import './FloatingScrollbarContainer.scss';

interface State {
	showDummyScroll: boolean;
}

export default class FloatingScrollbarContainer extends React.Component<any, State> {
	private scrollableContainer: HTMLElement;
	private scrollbarDummyContainer: HTMLElement;
	private scrollbarDummyInnerContainer: HTMLElement;
	private _preventEvent: boolean;

	constructor(props) {
		super(props);
		this.state = {
			showDummyScroll: true
		};
		this._preventEvent = false;
	}

	private onScrollableContainerRef = ref => {
		if (!this.scrollableContainer) {
			this.scrollableContainer = findDOMNode(ref);
		}
	};

	private scrollbarDummyContainerRef = ref => {
		if (!this.scrollbarDummyContainer) {
			this.scrollbarDummyContainer = findDOMNode(ref);
		}
	};

	private scrollbarDummyInnerContainerRef = ref => {
		if (!this.scrollbarDummyInnerContainer) {
			this.scrollbarDummyInnerContainer = findDOMNode(ref);
		}
	};

	onWindowResize = () => {
		this.adjustDummyScrollbar();
		this.checkScrollbarVisibility();
	};

	onWindowScroll = () => {
		this.checkScrollbarVisibility();
	};

	handleDummyScroll = e => {
		e.stopPropagation();
		if (this._preventEvent) {
			this._preventEvent = false;
			return;
		}
		this._preventEvent = true;
		this.scrollableContainer.scrollLeft = e.target.scrollLeft;
	};

	handleContainerScroll = e => {
		if (this._preventEvent) {
			this._preventEvent = false;
			return;
		}

		this._preventEvent = true;
		this.scrollbarDummyContainer.scrollLeft = e.target.scrollLeft;
	};

	adjustDummyScrollbar = () => {
		const { left, width } = this.scrollableContainer.getBoundingClientRect();
		this.scrollbarDummyContainer.style.left = `${left}px`;
		this.scrollbarDummyContainer.style.width = `${width}px`;
		this.scrollbarDummyInnerContainer.style.width = `${this.scrollableContainer.scrollWidth}px`;
	};

	checkScrollbarVisibility = () => {
		const windowScrollPos = window.scrollY + window.innerHeight;
		const elBottomPos =
			this.scrollableContainer.getBoundingClientRect().top + window.scrollY + this.scrollableContainer.offsetHeight;
		this.setState({ showDummyScroll: windowScrollPos < elBottomPos });
	};

	componentDidMount() {
		this.adjustDummyScrollbar();
		window.addEventListener('resize', this.onWindowResize);
		window.addEventListener('scroll', this.onWindowScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResize);
		window.removeEventListener('scroll', this.onWindowScroll);
	}

	render() {
		const { showDummyScroll } = this.state;
		return (
			<div className={bem.b()} ref={this.onScrollableContainerRef} onScroll={this.handleContainerScroll}>
				{this.props.children}

				<div
					ref={this.scrollbarDummyContainerRef}
					className={cx(bem.e('scrollbar'), { invisible: !showDummyScroll })}
					onScroll={this.handleDummyScroll}
				>
					<div className={bem.e('scrollbar-dummy')} ref={this.scrollbarDummyInnerContainerRef} />
				</div>
			</div>
		);
	}
}
