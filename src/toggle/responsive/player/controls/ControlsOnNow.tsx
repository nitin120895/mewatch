import * as React from 'react';
import OnNowIcon from './icons/OnNowIcon';

interface OwnProps {
	className?: string;
	toggleOverlay: () => void;
}

export default class ControlsOnNow extends React.PureComponent<OwnProps> {
	render() {
		const { className, toggleOverlay } = this.props;
		return (
			<div className={className} onClick={toggleOverlay}>
				<OnNowIcon />
			</div>
		);
	}
}
