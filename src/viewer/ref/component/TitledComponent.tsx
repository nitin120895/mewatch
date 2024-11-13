import * as React from 'react';
import * as cx from 'classnames';

export default function TitledComponent(props) {
	return (
		<div className={cx('titled-comp', props.className)}>
			<h4 className="titled-comp__heading">{props.title}</h4>
			{props.subtitle ? (
				<p>
					<em>{props.subtitle}</em>
				</p>
			) : (
				undefined
			)}
			{props.children}
		</div>
	);
}
