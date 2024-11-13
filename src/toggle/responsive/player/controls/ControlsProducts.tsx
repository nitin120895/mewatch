import * as React from 'react';
import BagIcon from './icons/BagIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsProductsProps extends React.Props<any> {
	className?: string;
	onClick: () => void;
}

export default (props: ControlsProductsProps) => {
	const { className, onClick } = props;

	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={onClick}
			formattedProps={{ 'aria-label': 'Products' }}
		>
			<BagIcon />
		</IntlFormatter>
	);
};
