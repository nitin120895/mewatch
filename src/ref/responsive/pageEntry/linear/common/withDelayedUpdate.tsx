import * as React from 'react';
import { get } from 'shared/util/objects';

export interface WithProgressProps {
	timestamp?: number;
	hasDelayedUpdated?: boolean;
}

export function selectUpdateTimeByKey(key: string) {
	return (props: object): number | undefined => {
		const date = get(props, key);
		return date ? date.getTime() : 0;
	};
}

/**
 * Use it for a delayed update of wrapped component based on the selected time.
 * The selector function is called when HOC is mounted and receives new props.
 * The next updated is scheduled based on a time received by the selector function.
 *
 * Configuration of the HOC:
 * @callback selectUpdateTime - Selector function.
 * @param {object} props - Props passed to the HOC.
 * @returns {number | undefined} - The time in millisecond.
 *
 * @returns {Function} - Returns the function to be called with passed Component to be extended.
 */
export default function withDelayedUpdate(selectUpdateTime: (props: object) => number | undefined) {
	return function<OwnProps>(Component) {
		return class extends React.PureComponent<OwnProps & WithProgressProps> {
			static defaultProps = {
				hasDelayedUpdated: true
			};
			state = {
				timestamp: 0
			};
			private timeout = undefined;
			private nextUpdateTime = undefined;

			componentDidMount() {
				if (this.props.hasDelayedUpdated) this.start();
			}

			componentWillUnmount() {
				this.clear();
			}

			componentWillReceiveProps(nextProps: OwnProps & WithProgressProps) {
				const selectedUpdateTime = selectUpdateTime(nextProps);

				if (this.props.hasDelayedUpdated && this.nextUpdateTime !== selectedUpdateTime) {
					this.clear();
					this.start(selectedUpdateTime);
				}
			}

			private start = (selectedUpdateTime?: number) => {
				const now = Date.now();
				const nextUpdateTime = selectedUpdateTime || selectUpdateTime(this.props);

				this.setState({ timestamp: now });

				if (nextUpdateTime && nextUpdateTime > now) {
					this.nextUpdateTime = nextUpdateTime;
					this.timeout = window.setTimeout(this.start, nextUpdateTime - now);
				}
			};

			private clear() {
				if (this.timeout) window.clearTimeout(this.timeout);
			}

			render() {
				return <Component {...this.props} {...this.state} />;
			}
		};
	};
}
