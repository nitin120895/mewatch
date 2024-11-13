import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { isIE11 } from 'shared/util/browser';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';

import './PageNotFound.scss';

const bem = new Bem('page-not-found');

const rect1OverlaySrc = require(`../../../../resource/toggle/welcomeScreen/rectangle1.png`);
const rect2OverlaySrc = require(`../../../../resource/toggle/welcomeScreen/rectangle2.png`);
const backgroundSrc = require(`../../../../resource/toggle/welcomeScreen/bitmap.png`);
const ie11 = isIE11();

const PageNotFound = (props: PageProps) => (
	<div className={bem.e('container')}>
		<div className={bem.b()} style={{ backgroundImage: `url(${backgroundSrc})` }}>
			<div className={bem.e('contents', { ie11 })}>
				<h1 className={bem.e('header')}>
					<IntlFormatter className={bem.e('status-code')}>{'@{page_not_found_status_code}'}</IntlFormatter>
					<IntlFormatter className={bem.e('error')}>{'@{page_not_found_error}'}</IntlFormatter>
				</h1>
				<IntlFormatter elementType="h2" className={bem.e('title')}>
					{'@{page_not_found_sorry}'}
				</IntlFormatter>
				<IntlFormatter elementType="p" className={bem.e('message')}>
					{'@{page_not_found_message}'}
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

export default PageNotFound;
