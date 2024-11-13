import * as React from 'react';
import CtaToggleButton from 'ref/responsive/component/CtaToggleButton';

interface TrailerButtonProps {
	className?: string;
	onClick?: () => void;
}

const SVG_DATA = 'm1,1v22h22v-22zm8.5,7v7l5,-3.5l-5,-3.5zl2,4z';

export default ({ className, onClick }: TrailerButtonProps) => (
	<CtaToggleButton
		className={className}
		labelId="@{itemDetail_action_trailer|Trailer}"
		svgData={SVG_DATA}
		onClick={onClick}
	/>
);
