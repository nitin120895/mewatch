import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './WelcomeScreen.scss';

interface Props {
	showHomePageGuidingTips: (value: boolean) => void;
}

const bem = new Bem('welcome-screen');
const rect1OverlaySrc = require(`../../../../../resource/toggle/welcomeScreen/rectangle1.png`);
const rect2OverlaySrc = require(`../../../../../resource/toggle/welcomeScreen/rectangle2.png`);
const backgroundSrc = require(`../../../../../resource/toggle/welcomeScreen/bitmap.png`);
const logoSrc = require(`../../../../../resource/toggle/welcomeScreen/logo@3x.png`);
const glowSrc = require(`../../../../../resource/toggle/welcomeScreen/glow.svg`);

export default class WelcomeScreen extends React.PureComponent<Props> {
	render() {
		return (
			<div className={bem.b()} style={{ backgroundImage: `url(${backgroundSrc})` }}>
				<div className={bem.e('content')}>
					<IntlFormatter elementType="div" className={bem.e('title')}>
						{'@{welcome_screen_title}'}
					</IntlFormatter>
					<div className={bem.e('images')}>
						<img className={bem.e('images', 'glow')} src={glowSrc} />
						<img className={bem.e('images', 'logo')} src={logoSrc} />
					</div>
					<IntlFormatter elementType="div" className={bem.e('description')}>
						{'@{welcome_screen_description}'}
					</IntlFormatter>
					<div onClick={this.onClickStart} className={bem.e('button')}>
						<CtaButton ordinal="primary">
							<IntlFormatter elementType="div">{'@{welcome_screen_btn_label}'}</IntlFormatter>
						</CtaButton>
					</div>
				</div>
				<div className={bem.e('background-images')}>
					<img className={bem.e('background-images', 'rect1')} src={rect1OverlaySrc} />
					<img className={bem.e('background-images', 'rect2')} src={rect2OverlaySrc} />
				</div>
			</div>
		);
	}

	onClickStart = () => this.props.showHomePageGuidingTips(true);
}
