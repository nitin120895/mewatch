import * as React from 'react';
import * as cx from 'classnames';

interface CalendarIconProps extends React.Props<any> {
	className?: string;
}

export default (props: CalendarIconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} viewBox="0 0 32 32">
			<g fill="currentColor" fillRule="evenodd">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M8.00033 2.66667C7.26395 2.66667 6.66699 3.26362 6.66699 4V5.33333H4.66699C3.56242 5.33333 2.66699 6.22876 2.66699 7.33333V10.6667H29.3337V7.33333C29.3337 6.22877 28.4382 5.33333 27.3337 5.33333H25.3337V4C25.3337 3.26362 24.7367 2.66667 24.0003 2.66667C23.2639 2.66667 22.667 3.26362 22.667 4V5.33333H9.33366V4C9.33366 3.26362 8.7367 2.66667 8.00033 2.66667ZM29.3337 13.3333H2.66699V27.3333C2.66699 28.4379 3.56242 29.3333 4.66699 29.3333H27.3337C28.4382 29.3333 29.3337 28.4379 29.3337 27.3333V13.3333Z"
				/>
			</g>
		</svg>
	);
};
