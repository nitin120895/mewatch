import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { convertColorToBackgroundStyle } from '../pageEntry/linear/common/utils';

import './ProgressBar.scss';

interface ProgressBarProps {
	progress: number;
	color?: api.ThemeColor;
	className?: string;
}

interface ProgressBarStateProps {
	style: object;
}

const bem = new Bem('progress-bar');

export default class ProgressBar extends React.PureComponent<ProgressBarProps, ProgressBarStateProps> {
	constructor(props) {
		super(props);

		this.state = {
			style: convertColorToBackgroundStyle(props.color)
		};
	}

	render() {
		const { progress, className } = this.props;

		return (
			<div className={cx(bem.b(), className)}>
				<div className={bem.e('bar')} style={{ ...this.state.style, width: `${progress}%` }} />
			</div>
		);
	}
}
