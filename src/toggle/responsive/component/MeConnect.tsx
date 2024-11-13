import * as React from 'react';
import { Bem } from 'shared/util/styles';
import MeConnectLogo from './icons/ssoIcons/MeConnectLogo';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import MeConnectWatch from 'toggle/responsive/component/icons/ssoIcons/MeConnectWatch';
import MeConnectRewards from 'toggle/responsive/component/icons/ssoIcons/MeConnectRewards';
import MeConnectListen from 'toggle/responsive/component/icons/ssoIcons/MeConnectListen';
import MeConnectCna from 'toggle/responsive/component/icons/ssoIcons/MeConnectCna';
import MeConnectEight from 'toggle/responsive/component/icons/ssoIcons/MeConnectEight';
import MeConnectToday from 'toggle/responsive/component/icons/ssoIcons/MeConnectToday';
import MeConnectBerita from 'toggle/responsive/component/icons/ssoIcons/MeConnectBerita';
import MeConnectSethi from 'toggle/responsive/component/icons/ssoIcons/MeConnectSethi';
import MeConnectEightDays from 'toggle/responsive/component/icons/ssoIcons/MeConnectEightDays';

import './MeConnect.scss';

interface Props {
	isMobileView: boolean;
}

export const bem = new Bem('me-connect');

class MeConnectComponent extends React.PureComponent<Props> {
	private renderIcons() {
		return (
			<div className={bem.e('logo-grid')}>
				{[
					<MeConnectWatch />,
					<MeConnectListen />,
					<MeConnectRewards />,
					<MeConnectCna />,
					<MeConnectEight />,
					<MeConnectToday />,
					<MeConnectBerita />,
					<MeConnectSethi />,
					<MeConnectEightDays />
				].map((logo, i) => (
					<div className={bem.e('logo')} key={i}>
						{logo}
					</div>
				))}
			</div>
		);
	}

	render() {
		return (
			<div className={bem.b()}>
				<div className={bem.e('container')}>
					<div className={bem.e('logo-link')}>
						<MeConnectLogo />
					</div>
					<div className={bem.e('content')}>
						<IntlFormatter elementType="div" className={bem.e('header')}>
							{'@{me_connect_header}'}
						</IntlFormatter>
						<IntlFormatter elementType="div" className={bem.e('description')}>
							{'@{me_connect_description}'}
						</IntlFormatter>
						<IntlFormatter elementType="div" className={bem.e('usage')}>
							{'@{me_connect_usage}'}
						</IntlFormatter>
					</div>
					{this.renderIcons()}
				</div>
			</div>
		);
	}
}

export default MeConnectComponent;
