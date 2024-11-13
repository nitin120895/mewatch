import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { isIE11 } from 'shared/util/browser';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';

import './Maintenance.scss';

const bem = new Bem('maintenance');

const rect1OverlaySrc = require(`../../../../resource/toggle/welcomeScreen/rectangle1.png`);
const rect2OverlaySrc = require(`../../../../resource/toggle/welcomeScreen/rectangle2.png`);
const backgroundSrc = require(`../../../../resource/toggle/welcomeScreen/bitmap.png`);
const ie11 = isIE11();

const Maintenance = () => (
	<div className={bem.e('container')}>
		<div className={bem.b()} style={{ backgroundImage: `url(${backgroundSrc})` }}>
			<div className={bem.e('contents', { ie11 })}>
				<IntlFormatter className={bem.e('header')} elementType="h1">
					{'@{page_maintenance_payment|Maintenance in progress}'}
				</IntlFormatter>

				<IntlFormatter elementType="h2" className={bem.e('title')}>
					{'@{page_maintenance_payment_sorry}'}
				</IntlFormatter>

				<IntlFormatter elementType="p" className={bem.e('message')}>
					{'@{page_maintenance_payment_message| }'}
				</IntlFormatter>

				<Link to="@home" className={bem.e('button')}>
					<IntlFormatter elementType={CtaButton} formattedProps={{ ordinal: 'primary' }}>
						{'@{page_not_found_button_cta}'}
					</IntlFormatter>
				</Link>
			</div>
			<div className={bem.e('background-images')}>
				<img className={bem.e('background-images', 'rect1')} src={rect1OverlaySrc} />
				<img className={bem.e('background-images', 'rect2')} src={rect2OverlaySrc} />
			</div>
		</div>
	</div>
);

export default Maintenance;
