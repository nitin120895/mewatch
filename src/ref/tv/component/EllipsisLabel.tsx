import * as React from 'react';
import { ellipsisText } from 'ref/tv/util/text';

interface EllipsisLabelProps extends React.HTMLProps<any> {
	element?: string;
	text: string;
}

export default class EllipsisLabel extends React.Component<EllipsisLabelProps, {}> {
	static defaultProps = { element: 'div', text: '' };
	private ref: HTMLDivElement;

	constructor(props: EllipsisLabelProps) {
		super(props);
	}

	componentDidMount() {
		this.ellipsisText();
	}

	componentDidUpdate() {
		this.ellipsisText();
	}

	private ellipsisText = () => {
		const { text } = this.props;
		ellipsisText(this.ref, text);
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { element, text, ...others } = this.props;
		return React.createElement(element, { ...others, ref: this.onRef }, text || '');
	}
}
