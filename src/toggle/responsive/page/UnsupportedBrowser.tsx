import * as React from 'react';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import BrandLogo from 'ref/responsive/component/AxisLogo';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Link } from 'react-router';

import './UnsupportedBrowser.scss';

const HELP_CENTRE_PATH = process.env.CLIENT_MC_HELP_CENTRE;

const bem = new Bem('unsupported-browser');

const UnsupportedBrowser = (props: PageProps) => (
	<div className={bem.e('container')}>
		<div className={bem.b()}>
			<div className={bem.e('contents')}>
				<BrandLogo role="presentation" className={bem.e('logo')} svgIndex="transparent" />
				<IntlFormatter elementType="h2" className={bem.e('title')}>
					{'@{unsupported_browser_title | Please Upgrade Your Current Browser }'}
				</IntlFormatter>
				<IntlFormatter elementType="p" className={bem.e('message')}>
					{"@{unsupported_browser_message_1 | Your browser's current version is not compatible.}"}
				</IntlFormatter>
				<IntlFormatter elementType="p" className={bem.e('message')}>
					{
						'@{unsupported_browser_message_2 | For optimal experience, please refer to the Help Centre for the list of supported browsers.}'
					}
				</IntlFormatter>

				<Link target="_blank" to={HELP_CENTRE_PATH}>
					<IntlFormatter
						elementType={CtaButton}
						className={bem.e('cta')}
						componentProps={{
							ordinal: 'primary',
							theme: 'light'
						}}
					>
						{'@{help_centre_link_label|Go to Help Centre}'}
					</IntlFormatter>
				</Link>
			</div>
		</div>
	</div>
);

export default UnsupportedBrowser;
