import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './MaskSection.scss';

interface MaskSectionProps {
	className?: string;
	onClick: () => void;
	label: string;
	labelChange: string;
	value: string;
	maskLabel?: string;
}

const bem = new Bem('acct-mask');

export default function MaskSection(props: MaskSectionProps) {
	const { className, onClick, labelChange, label, value, maskLabel } = props;
	return (
		<div className={cx(bem.b(), className)}>
			<IntlFormatter elementType="h4" className={bem.e('title')}>
				{label}
			</IntlFormatter>
			<div className={bem.e('pwd-change')}>
				{maskLabel && (
					<IntlFormatter elementType="label" className={bem.e('text')}>
						{maskLabel}
					</IntlFormatter>
				)}
				{!maskLabel && (
					<input type="password" value={value} className={bem.e('pwd-mask-input')} readOnly tabIndex={-1} />
				)}
				<IntlFormatter className={bem.e('link')} onClick={onClick}>
					{labelChange}
				</IntlFormatter>
			</div>
		</div>
	);
}
