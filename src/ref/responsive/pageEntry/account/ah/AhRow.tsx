import * as React from 'react';
import * as cx from 'classnames';

import './AhRow.scss';

export default function AhTitle({ className, children }) {
	return <div className={cx('ah-row', className)}>{children}</div>;
}
