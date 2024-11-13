import * as React from 'react';
import CtaButton from 'ref/tv/component/CtaButton';

interface TrailerButtonProps {
	className?: string;
	onClick?: () => void;
}

export default ({ className, onClick }: TrailerButtonProps) => (
	<CtaButton className={className} onClick={onClick} label={'@{itemDetail_action_trailer}'} />
);
