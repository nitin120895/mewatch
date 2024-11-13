import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import * as React from 'react';
import { XCHD2 as template } from 'shared/page/pageEntryTemplate';
import XCHD1 from 'toggle/responsive/pageEntry/channelDetail/xchd1/Xchd1';

const bem = new Bem('xchd2');

export default function XCHD2(props) {
	// deprecated MeliveLinearPlayer component so return XCHD1.
	return (
		<div className={cx(bem.b(), 'full-bleed')}>
			<XCHD1 {...props} />
		</div>
	);
}

XCHD2.template = template;
