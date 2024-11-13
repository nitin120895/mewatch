import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { getDeviceBreakpoints, DeviceBreakpoints } from '../util/grid';
import Picture from 'shared/component/Picture';
import { resolvePartnerLogo } from 'shared/util/images';

import './PartnerLogo.scss';

const bem = new Bem('partner-logo');

interface ImageWidth {
	mobile: number;
	tablet: number;
	desktopWide: number;
}

interface Props {
	item: api.ItemDetail | api.ScheduleItemSummary;
	imageWidth: ImageWidth;
	className?: string;
}

export default class PartnerLogo extends React.Component<Props> {
	render() {
		const { className, item, imageWidth } = this.props;
		const images = item.images;
		const { mobileBp, tabletBp, desktopBp }: DeviceBreakpoints = getDeviceBreakpoints();
		const { mobile, tablet, desktopWide } = imageWidth;
		const imageSources = [
			{ src: resolvePartnerLogo(images, mobile), mediaQuery: mobileBp },
			{ src: resolvePartnerLogo(images, tablet), mediaQuery: tabletBp },
			{ src: resolvePartnerLogo(images, desktopWide), mediaQuery: desktopBp }
		];
		if (!imageSources.length) return <div />;
		return (
			<div className={cx(bem.b(), className)}>
				<Picture src={imageSources[0].src} sources={imageSources} imageClassName={bem.e('logo')} />
			</div>
		);
	}
}
