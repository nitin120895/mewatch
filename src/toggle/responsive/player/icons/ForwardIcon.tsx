import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="105" height="105" viewBox="0 0 105 105">
			<g fill="currentColor" fillRule="evenodd">
				<path d="M54.055 101C26.455 101 4 79.243 4 52.5S26.454 4 54.055 4c17.227 0 33.318 8.692 42.43 22.803V11.097c0-1.214.987-2.202 2.198-2.202 1.213 0 2.198.988 2.198 2.202V35.75H76.27a2.203 2.203 0 0 1 0-4.405h17.51c-8.01-14.002-23.15-22.663-39.726-22.663C29.025 8.683 8.66 28.339 8.66 52.5c0 24.163 20.365 43.819 45.395 43.819 17.654 0 35.116-12.001 42.463-29.183l.2-.468L101 68.516l-.199.467C92.74 87.834 73.516 101 54.055 101" />
				<path d="M39.31 66V45.138l-4.637 1.14-1.216-4.788 7.638-2.28h3.99V66H39.31zm23.103.456c-7.106 0-11.78-5.966-11.78-13.68V52.7c0-7.714 4.788-13.756 11.856-13.756 7.03 0 11.78 5.966 11.78 13.68v.076c0 7.714-4.75 13.756-11.856 13.756zm.076-5.282c3.534 0 5.776-3.572 5.776-8.398V52.7c0-4.826-2.356-8.474-5.852-8.474-3.496 0-5.776 3.534-5.776 8.398v.076c0 4.864 2.318 8.474 5.852 8.474z" />
			</g>
		</svg>
	);
};
