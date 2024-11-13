import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CloseCross from 'ref/responsive/component/CloseCross';

const bem = new Bem('notification');

import './Notification.scss';

export default ({ text, onClick }) => {
	return (
		<div className={bem.b()}>
			<div className={bem.e('hint-icon')} />
			<span dangerouslySetInnerHTML={{ __html: text }} />
			<CloseCross className={bem.e('close-btn')} onClick={onClick} />
		</div>
	);
};
