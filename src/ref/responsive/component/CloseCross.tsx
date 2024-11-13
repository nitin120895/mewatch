import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CrossIcon from 'ref/responsive/component/icons/CrossIcon';

interface CloseCrossProps extends React.HTMLAttributes<any> {
	className?: string;
	onClick?: () => void;
	ariaLabel?: string;
}

const defaultModalLabel = '@{itemDetail_modalDlg_close_label|Close modal}';

export default ({ className, onClick, ariaLabel = defaultModalLabel, ...otherProps }: CloseCrossProps) => {
	return (
		<IntlFormatter
			elementType="button"
			className={className}
			onClick={onClick}
			formattedProps={{ 'aria-label': ariaLabel }}
		>
			<CrossIcon {...otherProps} />
		</IntlFormatter>
	);
};
