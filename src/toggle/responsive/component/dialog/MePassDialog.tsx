import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import CtaButton from 'ref/responsive/component/CtaButton';
import Dialog from './Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';

import './MePassDialog.scss';

export interface MePassDialogProps {
	id?: string;
	className?: string;
	title?: string;
	onClose?: () => void;
	confirmLabel?: string;
	hideCloseIcon?: boolean;
	children?: any;
	mePass?: boolean;
}

const bem = new Bem('mepass-dialog');

export default class MePassDialog extends React.PureComponent<MePassDialogProps> {
	static defaultProps = {
		confirmLabel: '@{app.confirm|Confirm}',
		hideCloseIcon: true
	};

	render() {
		const { className, children, title, confirmLabel, hideCloseIcon, onClose } = this.props;

		return (
			<Dialog onClose={onClose} hideCloseIcon={hideCloseIcon} className={cx(className, bem.b())}>
				{title && <DialogTitle>{title}</DialogTitle>}
				<div className={bem.e('content')}>
					{typeof children === 'string' ? <IntlFormatter>{children}</IntlFormatter> : children}
				</div>
				<div className={bem.e('buttons')}>
					<IntlFormatter
						elementType={CtaButton}
						className={bem.e('primary-btn')}
						componentProps={{
							theme: 'light',
							ordinal: 'primary',
							onClick: onClose,
							mePass: true
						}}
					>
						{confirmLabel}
					</IntlFormatter>
				</div>
			</Dialog>
		);
	}
}
