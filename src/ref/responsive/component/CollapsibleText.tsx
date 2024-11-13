import * as React from 'react';
import { findDOMNode } from 'react-dom';
import CollapsibleContainer, { CollapsibleContainerProps } from './CollapsibleContainer';

interface CollapsibleTextProps extends CollapsibleContainerProps {
	maxLines?: number;
}

interface CollapsibleTextState {
	maxHeight?: string;
}

/**
 * Augments CollapsibleContainer with additional functionality to calculate line heights
 * at runtime, making it more convenient to render text that will collapse when it
 * exceeds a given max number of lines.
 */
export default class CollapsibleText extends React.Component<CollapsibleTextProps, CollapsibleTextState> {
	private container: HTMLElement;
	private lineHeight: number;

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.updateMaxHeight();
	}

	componentDidUpdate() {
		this.updateMaxHeight();
	}

	private getLineHeight() {
		if (!this.container) {
			return undefined;
		} else if (this.lineHeight === undefined) {
			this.lineHeight = parseInt(window.getComputedStyle(this.container).lineHeight);
		}
		return this.lineHeight;
	}

	private updateMaxHeight() {
		const lineHeight = this.getLineHeight();
		if (lineHeight === undefined) return;
		const maxHeight = this.props.maxLines * lineHeight + 'px';
		if (this.state.maxHeight !== maxHeight) {
			this.setState({ maxHeight });
		}
	}

	private onReference = (ref: React.ReactInstance) => {
		this.container = ref ? findDOMNode<HTMLElement>(ref) : undefined;
	};

	render() {
		return (
			<CollapsibleContainer {...this.props} ref={this.onReference} maxHeight={this.state.maxHeight}>
				{this.props.children}
			</CollapsibleContainer>
		);
	}
}
