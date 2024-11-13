import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import * as cx from 'classnames';

import './PlayIcon.scss';

const bem = new Bem('play-icon');

interface PlayIconProps extends React.HTMLProps<any> {
	onClick?: (e) => void;
	width?: number;
	height?: number;
	className?: string;
	active?: boolean;
}

export default function PlayIcon({ className, width = 39, height = 39, onClick = noop, active = true }: PlayIconProps) {
	return (
		<div className={cx(bem.b({ disabled: !active }), className)} onClick={onClick}>
			<div className={bem.e('container')} disabled={!active}>
				<svg width={width} height={height} viewBox="0 0 39 39" cx="19.386" cy="19.5">
					<defs>
						<ellipse id="a" cx="19.386" cy="19.5" rx="19.386" ry="19.5" />
					</defs>
					<g fill="none" fillRule="evenodd">
						<ellipse
							cx="19.386"
							cy="19.5"
							className={bem.e('circle')}
							rx="18.886"
							ry="19"
							fill="#000"
							fillOpacity=".3"
						/>
						<path className={bem.e('arrow')} d="M27.87 20.14l-13.426 7.08V13.06z" />
					</g>
				</svg>
			</div>
		</div>
	);
}
