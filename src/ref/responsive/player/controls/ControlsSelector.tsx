import * as React from 'react';
import SelectorIcon from './icons/SelectorIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface ControlsSelectorProps extends React.Props<any> {
	className?: string;
}

export default (props: ControlsSelectorProps) => {
	const { className } = props;

	return (
		<IntlFormatter
			elementType="button"
			type="button"
			className={className}
			formattedProps={{ 'aria-label': '@{player_selector|Cinema mode}' }}
		>
			<SelectorIcon />
		</IntlFormatter>
	);
};
