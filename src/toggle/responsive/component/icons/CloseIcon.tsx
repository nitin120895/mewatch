import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="14" height="14" viewBox="0 0 14 14">
			<g fill="none" fillRule="evenodd">
				<g stroke="#FFF">
					<g>
						<g>
							<g strokeWidth="2">
								<path d="M0 0L6 5.933 12 0" transform="translate(-843 -606) translate(148 587) translate(696 20)" />
								<path
									d="M0 6L6 11.933 12 6"
									transform="translate(-843 -606) translate(148 587) translate(696 20) rotate(180 6 8.966)"
								/>
							</g>
						</g>
					</g>
				</g>
			</g>
		</svg>
	);
};
