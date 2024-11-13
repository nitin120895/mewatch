import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { fallbackURI } from 'shared/util/images';
import { convertColorToBackgroundStyle } from './utils';

import './ChannelLogo.scss';

interface ChannelLogoProps {
	logo: string;
	title: string;
	color?: api.ThemeColor;
	className?: string;
}

const bem = new Bem('channel-logo');

export default function ChannelLogo({ logo, title, color, className }: ChannelLogoProps) {
	const isChannelLogo = logo && logo !== fallbackURI;
	const isShowTitle = !isChannelLogo && !!title;
	const style = isShowTitle ? convertColorToBackgroundStyle(color) : undefined;

	// tslint:disable-next-line: no-null-keyword
	if (!isChannelLogo && !isShowTitle) return null;

	return (
		<div className={cx(bem.b({ text: isShowTitle }), className)} style={style}>
			{isChannelLogo && <img className={bem.e('image')} src={logo} alt={title} />}
			{isShowTitle && <div className={cx(bem.e('title'), 'truncate')}> {title}</div>}
		</div>
	);
}
