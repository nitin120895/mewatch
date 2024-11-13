import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter, { IntlValue } from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';

import './A2Section.scss';

const bem = new Bem('a2-section');

interface A2SectionProps extends React.Props<any> {
	sectionTitle: IntlValue;
	className?: string;
	primary?: boolean;
}

export default function A2Section({ className, sectionTitle, primary, children }: A2SectionProps) {
	return (
		<div className={cx(bem.b(), className)}>
			<IntlFormatter elementType="h5" className={bem.e('title')}>
				{sectionTitle}
			</IntlFormatter>
			<div className={bem.e('content', { primary })}>{children}</div>
		</div>
	);
}
