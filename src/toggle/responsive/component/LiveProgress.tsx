import * as React from 'react';
import ProgressBar from 'ref/responsive/component/ProgressBar';

import './LiveProgress.scss';

const TIMEOUT = 1000; // 1s

interface Props {
	from: Date;
	to: Date;
	barColour?: string;
}

interface State {
	progress: number;
	fromEpoc?: number;
	toEpoc?: number;
	duration?: number;
}

export default class LiveProgress extends React.Component<Props, State> {
	private animating = false;
	private times: number;

	state = {
		fromEpoc: undefined,
		toEpoc: undefined,
		duration: undefined,
		progress: 0
	};

	componentDidMount() {
		this.initTime(this.props);
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
		const prevFrom = prevProps.from.getTime();
		const prevTo = prevProps.to.getTime();
		const from = this.props.from.getTime();
		const to = this.props.to.getTime();
		if (prevFrom !== from || prevTo !== to) {
			clearTimeout(this.times);
			this.initTime(this.props);
		}
	}

	componentWillUnmount() {
		clearTimeout(this.times);
		this.animating = false;
	}

	private initTime(props: Props) {
		const fromEpoc = props.from.getTime();
		const toEpoc = props.to.getTime();
		this.setState(
			{
				progress: 0,
				fromEpoc,
				toEpoc,
				duration: toEpoc - fromEpoc
			},
			this.animate
		);
		this.animating = true;
	}

	private animate = () => {
		const now = Date.now();
		const { fromEpoc, toEpoc, duration } = this.state;

		if (fromEpoc && toEpoc && toEpoc <= now) this.animating = false;
		if (!this.animating) return;

		const progress = ((now - fromEpoc) / duration) * 100;
		this.setState({ progress });
		this.times = window.setTimeout(this.animate, TIMEOUT);
	};

	render() {
		return <ProgressBar progress={this.state.progress} className="live-progress" />;
	}
}
