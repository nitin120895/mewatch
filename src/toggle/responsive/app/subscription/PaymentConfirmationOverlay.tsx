import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';

import './PaymentConfirmationOverlay.scss';

const bem = new Bem('payment-confirmation');

export interface PaymentConfirmationOverlayProps {
	title: string;
	body: any;
	onConfirm: () => void;
	confirmLabel: string;
	className?: string;
}

export default function PaymentConfirmationOverlay(props: PaymentConfirmationOverlayProps) {
	const { title, body, onConfirm, confirmLabel, className } = props;
	return (
		<div className={bem.b()}>
			<div className={className}>
				<IntlFormatter elementType="div" className={bem.e('title')}>
					{title}
				</IntlFormatter>
				<IntlFormatter elementType="div" className={bem.e('content')}>
					{body}
				</IntlFormatter>
				<IntlFormatter
					elementType={CtaButton}
					onClick={onConfirm}
					componentProps={{
						ordinal: 'primary',
						className: bem.e('cta')
					}}
				>
					{confirmLabel}
				</IntlFormatter>
			</div>
		</div>
	);
}
