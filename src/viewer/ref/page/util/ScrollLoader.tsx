import * as React from 'react';
import { Bem } from 'shared/util/styles';
import ScrollLoader from 'ref/responsive/component/ScrollLoader';

import './ScrollLoader.scss';

const bem = new Bem('scroll-loader');

export default class ScrollLoaderExample extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			eventFired: 0,
			enabled: true,
			loading: false
		};
	}

	enabled = () => this.setState({ enabled: true });
	disable = () => this.setState({ enabled: false });

	event = () => {
		this.setState({ loading: true });
		setTimeout(() => {
			this.setState({ loading: false });
			this.setState(prevState => {
				return { eventFired: prevState.eventFired + 1 };
			});
		}, 1000);
	};

	render() {
		const { eventFired, enabled, loading } = this.state;
		return (
			<section className={bem.b()}>
				<div className={bem.e('panel')}>
					<p>Once you get within a 100px of the line below the event will fire.</p>
					<p>
						<input type="button" value="Enable Event" onClick={this.enabled} />
					</p>
					<p>
						<input type="button" value="Disable Event" onClick={this.disable} />
					</p>
					<p>Enabled: {enabled ? 'true' : 'false'}</p>
					<p>Events fired: {eventFired}</p>
				</div>
				<ScrollLoader enabled={enabled} onLoad={this.event} loading={loading}>
					<div className={bem.e('container')} />
				</ScrollLoader>
				<div className={bem.e('end-container')}>
					<p>End Scroll</p>
				</div>
			</section>
		);
	}
}
