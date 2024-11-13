import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';

import './BonusLink.scss';

const bem = new Bem('bonus-link');

interface Props {
	url: string;
	label: string;
	target?: string;
}

export default function BonusLink(props: Props) {
	const { url, label, target } = props;

	return url ? (
		<Link target={target || '_blank'} to={url} className={bem.b()}>
			<IntlFormatter>{label}</IntlFormatter>
		</Link>
	) : (
		<IntlFormatter className={bem.b()}>{label}</IntlFormatter>
	);
}
