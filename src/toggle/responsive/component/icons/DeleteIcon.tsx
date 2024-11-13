import * as React from 'react';
interface IconProps extends React.Props<any> {
	className?: string;
	width?: number;
	height?: number;
}

export default (props: IconProps) => {
	const { className, width = 24, height = 24 } = props;
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9.05131 2.68377C9.18743 2.27543 9.56957 2 10 2H14C14.4304 2 14.8126 2.27543 14.9487 2.68377L15.7208 5H20C20.5523 5 21 5.44772 21 6C21 6.55228 20.5523 7 20 7H19.0001C19 7.02359 18.9992 7.04735 18.9975 7.07124L17.9975 21.0712C17.9601 21.5945 17.5247 22 17 22H7.00001C6.47537 22 6.03993 21.5945 6.00255 21.0712L5.00255 7.07124C5.00085 7.04735 4.99999 7.02359 4.99997 7H4C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5H8.27924L9.05131 2.68377ZM7.00256 7L7.93113 20H16.0689L16.9975 7H15.0231C15.0076 7.00036 14.9921 7.00036 14.9767 7H9.02334C9.00791 7.00036 8.99244 7.00036 8.97694 7H7.00256ZM13.2792 4L13.6126 5H10.3874L10.7208 4H13.2792Z"
				fill="currentColor"
			/>
		</svg>
	);
};
