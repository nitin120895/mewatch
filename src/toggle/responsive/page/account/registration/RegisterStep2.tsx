import * as React from 'react';
import * as cx from 'classnames';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { Home as homePageKey } from 'shared/page/pageKey';
import CtaButton from 'ref/responsive/component/CtaButton';
import { isMobile } from 'shared/util/browser';
import { browserHistory } from 'shared/util/browserHistory';
import { Home, ColdStart } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import Logo from 'ref/responsive/component/AxisLogo';
import { getRedirectPathAfterSignin, removeRedirectPathAfterSignin } from 'shared/page/pageUtil';
import Spinner from 'ref/responsive/component/Spinner';

import './RegisterStep2.scss';

const GOOGLE_PLAY_LINK = process.env.CLIENT_GOOGLE_PLAY_LINK;
const APP_STORE_LINK = process.env.CLIENT_APP_STORE_LINK;
const AppStoreIcon = require('../../../../../../resource/toggle/image/icon/desktop-social-sign-up-app-store-btn.png');
const PlayStoreIcon = require('../../../../../../resource/toggle/image/icon/desktop-social-sign-up-google-play-store-btn.png');

const registerFormStep2Bem = new Bem('register-step2');

interface Paths {
	home: string;
	coldStart: string;
}

interface RegisterStep2Props {
	config: state.Config;
	accountActive: boolean;
}

export default class RegisterStep2 extends React.PureComponent<RegisterStep2Props> {
	handleClick = e => {
		e.preventDefault();
		const redirect = getRedirectPathAfterSignin();

		const { home } = this.getRedirectPaths();

		if (redirect) {
			removeRedirectPathAfterSignin();
			browserHistory.replace(redirect);
		} else {
			browserHistory.push(home);
		}
	};

	onSubmit = e => {
		e.preventDefault();
		const { coldStart } = this.getRedirectPaths();

		browserHistory.push(coldStart);
	};

	private getRedirectPaths(): Paths {
		const { config } = this.props;
		return {
			home: getPathByKey(Home, config),
			coldStart: getPathByKey(ColdStart, config)
		};
	}

	render() {
		const { accountActive } = this.props;

		return (
			<div className={cx('form', 'form-white', registerFormStep2Bem.b(), 'txt-center')}>
				{this.renderHeader()}
				<div className={registerFormStep2Bem.e('content')}>
					<div>
						{this.renderSuccessTick()}
						<div className={registerFormStep2Bem.e('form-title')}>
							<IntlFormatter elementType="div">{'@{form_register_welcome_title|Thank You!}'}</IntlFormatter>
							<IntlFormatter elementType="div">
								{'@{form_register_welcome_sub_title|Your meconnect account has been created.}'}
							</IntlFormatter>
						</div>

						<IntlFormatter elementType="p" className={registerFormStep2Bem.e('form-text')}>
							{
								'@{form_register_welcome_message|Next, tell us what you like and we will recommend content just for you.}'
							}
						</IntlFormatter>
					</div>
					<div className={registerFormStep2Bem.e('primary-action')}>
						<Link to={`@${homePageKey}`}>
							<IntlFormatter
								className={registerFormStep2Bem.e('button')}
								elementType={CtaButton}
								type="submit"
								componentProps={{
									ordinal: 'primary',
									theme: 'light',
									onClick: this.onSubmit,
									mePass: true
								}}
							>
								{accountActive ? '@{form_register_welcome_watch_label|Yes, let’s do it now}' : <Spinner />}
							</IntlFormatter>
						</Link>
						<Link to={`@${homePageKey}`}>
							<IntlFormatter
								className={registerFormStep2Bem.e('button')}
								elementType={CtaButton}
								type="submit"
								componentProps={{
									ordinal: 'secondary',
									theme: 'dark',
									onClick: this.handleClick,
									mePass: true
								}}
							>
								{'@{form_register_welcome_later_label|No, I will do it later}'}
							</IntlFormatter>
						</Link>
					</div>
					{isMobile() && (
						<div className={registerFormStep2Bem.e('download-app-action')}>
							<IntlFormatter className="download-title">
								{'@{form_register_welcome_download|Download the Toggle app}'}
							</IntlFormatter>
							<Link to={GOOGLE_PLAY_LINK}>
								<img className="download-button google-play-button" src={PlayStoreIcon} />
							</Link>
							<Link to={APP_STORE_LINK}>
								<img className="download-button apple-app-store-button" src={AppStoreIcon} />
							</Link>
						</div>
					)}
				</div>
			</div>
		);
	}

	private renderHeader() {
		return (
			<div className={registerFormStep2Bem.e('header')}>
				<Logo className={registerFormStep2Bem.e('logo')} />
			</div>
		);
	}

	private renderSuccessTick() {
		return <div className={registerFormStep2Bem.e('success-tick')} />;
	}
}
