import * as React from 'react';
import { get } from 'shared/util/objects';

interface WithProgressConfig {
	fromKey?: string;
	toKey?: string;
	interval?: number;
}

interface WithProgressProps {
	from: Date;
	to: Date;
}

/**
 * Use it for calculating progress and passing it to the wrapped component.
 *
 * Configuration of the HOC:
 * @param {string} fromKey - The start date key.
 * @param {string} toKey - The end date key.
 * @param {number} interval - The interval of updating the progress.
 *
 * @returns {Function} - Returns the function to be called with passed Component to be extended.
 */
export default function withLiveProgress({ fromKey = 'from', toKey = 'to', interval = 1000 }: WithProgressConfig = {}) {
	return function<OwnProps>(Component) {
		return class extends React.PureComponent<OwnProps & WithProgressProps> {
			state = {
				progress: 0,
				duration: 0,
				from: 0,
				to: 0
			};
			private timeout = undefined;

			componentWillMount() {
				this.init(this.props);
			}

			componentWillUnmount() {
				this.clear();
			}

			componentWillReceiveProps(nextProps: OwnProps & WithProgressProps) {
				const { from, to } = this.state;

				if (from !== this.getTime(nextProps, fromKey) || to !== this.getTime(nextProps, toKey)) {
					this.init(nextProps);
				}
			}

			private init(props: OwnProps & WithProgressProps) {
				this.clear();

				const from = this.getTime(props, fromKey);
				const to = this.getTime(props, toKey);

				if (from && to) {
					this.setState({ progress: 0, from, to, duration: to - from }, this.start);
				}
			}

			private start = () => {
				const { from, to, duration } = this.state;
				const now = Date.now();

				if (from <= now && now <= to) {
					const progress = ((now - from) / duration) * 100;
					this.setState({ progress });
					this.timeout = window.setTimeout(this.start, interval);
				} else if (from > now) {
					this.timeout = window.setTimeout(this.start, from - now);
				}
			};

			private clear() {
				if (this.timeout) window.clearTimeout(this.timeout);
			}

			private getTime(props: object, key: string) {
				const date = get(props, key);
				return date ? date.getTime() : 0;
			}

			render() {
				return <Component {...this.props} progress={this.state.progress} />;
			}
		};
	};
}
