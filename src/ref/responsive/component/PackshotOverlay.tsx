import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';

import './PackshotOverlay.scss';

const bem = new Bem('packshot-overlay');

interface PackshotOverlayProps extends React.HTMLProps<any> {
	isDark?: boolean;
	onClick?: (e) => void;
	className?: string;
}

export default ({ isDark = false, onClick = noop, className }: PackshotOverlayProps) => {
	return <div className={cx(bem.b({ dark: isDark }), className)} onClick={onClick} />;
};
