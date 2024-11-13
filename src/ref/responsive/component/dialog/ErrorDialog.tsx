import * as React from 'react';
import Dialog from './Dialog';
import DialogTitle from './DialogTitle';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';

interface DialogProps extends React.Props<any> {
	className?: string;
	onClose?: () => void;
	title: string;
	description?: string;
}

export default function ErrorDialog(props: DialogProps) {
	const { className, title, description, children, onClose, ...rest } = props;
	return (
		<Dialog className={className} onClose={onClose} {...rest}>
			<DialogTitle>{title}</DialogTitle>
			{description && <IntlFormatter elementType="p">{description}</IntlFormatter>}
			{children}
			<CtaButton ordinal="primary" theme="light" onClick={onClose}>
				<IntlFormatter>{'@{error_dialog_button|Dismiss}'}</IntlFormatter>
			</CtaButton>
		</Dialog>
	);
}
