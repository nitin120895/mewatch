import * as cx from 'classnames';
import * as React from 'react';
import LinearPlayer from '../components/LinearPlayer';
import { Bem } from 'shared/util/styles';
import { XCHD1 as template } from 'shared/page/pageEntryTemplate';

import './Xchd1.scss';

const bem = new Bem('xchd1');

export default function XCHD1(props) {
	return (
		<div className={cx(bem.b(), 'full-bleed')}>
			<LinearPlayer {...props} />
		</div>
	);
}

XCHD1.template = template;
