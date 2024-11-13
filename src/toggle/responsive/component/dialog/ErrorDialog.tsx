import * as React from 'react';
import Dialog from 'ref/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { ErrorCta } from '../../player/Player';

interface DialogProps extends React.Props<any> {
	className?: string;
	onClose?: () => void;
	title: string;
	description?: string;
	additionalDescription?: string;
	cta?: string;
}

const ErrorCtaLabels = {
	[ErrorCta.DISMISS]: '@{error_dialog_button_dismiss|Dismiss}',
	[ErrorCta.OK]: '@{error_dialog_button_ok|OK}',
	[ErrorCta.TRY_AGAIN]: '@{error_dialog_button_try_again|Try again}'
};

export default function ErrorDialog(props: DialogProps) {
	const { className, title, description, additionalDescription, children, onClose, cta, ...rest } = props;
	const onClick = cta === ErrorCta.TRY_AGAIN ? () => location.reload() : onClose;
	return (
		<Dialog className={className} onClose={onClose} {...rest}>
			<DialogTitle>{title}</DialogTitle>
			{description && <IntlFormatter elementType="p">{description}</IntlFormatter>}
			{additionalDescription && <IntlFormatter elementType="p">{additionalDescription}</IntlFormatter>}
			{children}
			{cta && (
				<CtaButton ordinal="primary" theme="light" onClick={onClick}>
					<IntlFormatter>{ErrorCtaLabels[cta]}</IntlFormatter>
				</CtaButton>
			)}
		</Dialog>
	);
}
