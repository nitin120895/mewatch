import * as React from 'react';

interface TransitionSpeedProps {
	seconds: (val: number) => void;
	autoPlayIsEnabled?: boolean;
	autoPlayIsRunning?: boolean;
	toggleAutoPlay: (e) => void;
}

export default class AutoplayDelay extends React.Component<TransitionSpeedProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			autoCycle: 8
		};
	}

	private onChange = e => {
		this.setState({ autoCycle: e.target.value });
		if (this.props.seconds) this.props.seconds(e.target.value);
	};

	private toggleAutoPlay = e => {
		if (e.target.checked !== this.props.autoPlayIsEnabled) {
			this.props.toggleAutoPlay(e);
		}
	};

	render() {
		return (
			<div style={{ marginBottom: '40px' }}>
				<p>
					<label>Autoplay delay (in seconds)</label>
					<input type="text" className="default-input" value={this.state.autoCycle} onChange={this.onChange} />
				</p>
				<p>
					<input
						type="checkbox"
						id="checkbox-autoplay"
						name="checkbox-autoplay"
						onChange={this.toggleAutoPlay}
						checked={this.props.autoPlayIsEnabled}
					/>
					<label htmlFor="checkbox-autoplay">Autoplay Enabled</label>
				</p>
				<p>Autoplay Running: {this.props.autoPlayIsRunning ? 'running' : 'stopped'}</p>
				<p>Autoplay Enabled: {this.props.autoPlayIsEnabled ? 'true' : 'false'}</p>
			</div>
		);
	}
}
