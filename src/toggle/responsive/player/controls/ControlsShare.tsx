import * as React from 'react';
import ShareIcon from 'toggle/responsive/component/icons/ShareIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsShareProps extends React.Props<any> {
	className?: string;
	onClick: () => void;
}

export default (props: ControlsShareProps) => {
	const { className, onClick } = props;

	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={onClick}
			formattedProps={{ 'aria-label': 'Share' }}
		>
			<ShareIcon height="100%" width="100%" />
		</IntlFormatter>
	);
};
