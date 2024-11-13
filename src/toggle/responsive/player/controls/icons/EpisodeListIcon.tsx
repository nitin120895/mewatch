import * as React from 'react';
import * as cx from 'classnames';

interface EpisodeListIconProps extends React.Props<any> {
	className?: string;
}

export default (props: EpisodeListIconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 42 36">
			<g fill="currentColor" fillRule="evenodd">
				<path d="M3 11h30a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V14a3 3 0 0 1 3-3zm21.032 10.667l-8.479-5.635a1 1 0 0 0-1.553.833v11.27a1 1 0 0 0 1.553.833l8.48-5.635a1 1 0 0 0 0-1.666zM5 5h26a2 2 0 0 1 2 2v2H3V7a2 2 0 0 1 2-2zM7 0h22a2 2 0 0 1 2 2v1H5V2a2 2 0 0 1 2-2z" />
			</g>
		</svg>
	);
};
