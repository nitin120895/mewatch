import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import './AccountButton.scss';

interface AccountButtonProps extends React.HTMLProps<any> {
	label: string;
	labelColor: string;
	className?: string;
}

const bem = new Bem('account-button');

export default function AccountButton({ className, label, labelColor }: AccountButtonProps) {
	return (
		<div className={cx(bem.b(), className)} style={{ backgroundColor: labelColor }}>
			{label}
		</div>
	);
}
