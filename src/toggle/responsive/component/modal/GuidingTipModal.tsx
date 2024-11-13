import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import { GuidingTip, GuidingTipScreen } from 'shared/guides/guidesManager';
import { isPortrait, isMobilePortrait, isMobileLandscape, DeviceOrientation } from 'ref/responsive/util/grid';
import * as cx from 'classnames';
import Scrollable from 'ref/responsive/component/Scrollable';
import { isMobile, DeviceResolution } from 'shared/util/browser';
import { toggleBodyClass } from 'toggle/responsive/util/cssUtil';
import { GUIDING_TIP_MODAL_ID } from 'shared/uiLayer/uiLayerWorkflow';

import './GuidingTipModal.scss';

interface Props extends GuidingTip {
	className?: string;
	onClose: () => void;
}

interface State {
	deviceOrientation: string;
	deviceResolution: string;
}

const bem = new Bem('guiding-tip-modal');

class GuidingTipModal extends React.Component<Props, State> {
	state: State = {
		deviceOrientation: this.getDeviceOrientation(),
		deviceResolution: this.getDeviceResolution()
	};

	componentDidMount() {
		window.addEventListener('resize', this.onResize, false);
		toggleBodyClass(GUIDING_TIP_MODAL_ID);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		toggleBodyClass(GUIDING_TIP_MODAL_ID);
	}

	onResize = () => {
		this.setState({ deviceOrientation: this.getDeviceOrientation(), deviceResolution: this.getDeviceResolution() });
	};

	getDeviceOrientation(): DeviceOrientation {
		return isPortrait() ? DeviceOrientation.PORTRAIT : DeviceOrientation.LANDSCAPE;
	}

	getDeviceResolution(): DeviceResolution {
		if (!isMobile()) {
			return DeviceResolution.DESKTOP;
		}

		if (isMobilePortrait() || isMobileLandscape()) {
			return DeviceResolution.MOBILE;
		} else {
			return DeviceResolution.TABLET;
		}
	}

	getImage(image: GuidingTipScreen['image']): string {
		const { deviceOrientation, deviceResolution } = this.state;
		const isWeb = deviceResolution === DeviceResolution.DESKTOP;
		const img = isWeb ? image[`${deviceResolution}`] : image[`${deviceResolution}_${deviceOrientation}`];

		return require(`../../../../../resource/toggle/guides/${img}`);
	}

	renderGuidingTipScreens(screens: GuidingTipScreen[]) {
		return screens.map((screen, index) => {
			const { title, description, image, className } = screen;

			return (
				<div className={cx(bem.b(), className)} key={index}>
					<div className={cx(bem.e('content'))}>
						<div className={bem.e('text')}>
							<IntlFormatter elementType="div" className={bem.e('title')}>
								{title}
							</IntlFormatter>
							<IntlFormatter elementType="div" className={bem.e('description')}>
								{description}
							</IntlFormatter>
						</div>
						<div className={bem.e('image')}>
							<img src={this.getImage(image)} />
						</div>
					</div>
				</div>
			);
		});
	}

	renderScrollable() {
		const { screens, onClose } = this.props;
		const length = screens.length;

		return (
			<Scrollable length={length} showPaginationBullets={length > 1} isGuidingTip={true} onCloseGuidingTips={onClose}>
				{this.renderGuidingTipScreens(screens)}
			</Scrollable>
		);
	}

	render() {
		return <div>{this.renderScrollable()}</div>;
	}
}

export default function getGuidingTipModal(props: Props) {
	return <GuidingTipModal {...props} />;
}
