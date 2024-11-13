import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import ScrollMonitor from 'ref/responsive/util/ScrollMonitor';
import Spinner from './Spinner';

import './ScrollLoader.scss';

const BemScrollLoader = new Bem('scroll-loader');

interface ScrollMonitorInterface {
	enabled: boolean;
	loading: boolean;
	onLoad: () => void;
}

export default class ScrollLoader extends React.Component<ScrollMonitorInterface, any> {
	private scrollMonitor: ScrollMonitor;
	private element: HTMLElement;

	componentDidMount() {
		this.scrollMonitor = new ScrollMonitor(this.element);
		this.subscriptionCheck(this.props);
	}

	componentWillUnmount() {
		this.scrollMonitor.unsubscribe(this.props.onLoad);
	}

	componentWillReceiveProps(nextProps) {
		const { enabled, loading } = nextProps;
		if (enabled !== this.props.enabled || loading !== this.props.loading) {
			this.subscriptionCheck(nextProps);
		}
	}

	private subscriptionCheck({ enabled, loading, onLoad }) {
		if (enabled && !loading) this.scrollMonitor.subscribe(onLoad);
		else this.scrollMonitor.unsubscribe(onLoad);
	}

	private onReference = e => (this.element = e);

	render() {
		const { children, enabled, loading } = this.props;
		return (
			<div className={cx(BemScrollLoader.b())} ref={this.onReference}>
				{children}
				<div className={BemScrollLoader.e('spinner-container', { reveal: enabled && loading }, { enabled })}>
					<Spinner className={BemScrollLoader.e('spinner')} />
				</div>
			</div>
		);
	}
}
