import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Link from 'shared/component/Link';

import './RecaptchaDisclaimer.scss';

const bem = new Bem('recaptcha-terms');

const RecaptchaDisclaimer = () => {
	return (
		<div className={cx(bem.b(), 'clearfix')}>
			<IntlFormatter elementType={'span'} className={cx(bem.e('text'))}>
				{'@{recaptcha_label1|This site is protected by reCAPTCHA and the Google}'}
			</IntlFormatter>
			&nbsp;
			<IntlFormatter
				elementType={Link}
				className={cx(bem.e('link'), 'link')}
				componentProps={{ to: `https://policies.google.com/privacy` }}
			>
				{'@{recaptcha_label2|Privacy Policy}'}
			</IntlFormatter>
			&nbsp;
			<IntlFormatter elementType={'span'} className={cx(bem.e('text'))}>
				{'@{form_signIn_and_label|and}'}
			</IntlFormatter>
			&nbsp;
			<IntlFormatter
				elementType={Link}
				className={cx(bem.e('link'), 'link')}
				componentProps={{ to: `https://policies.google.com/terms` }}
			>
				{'@{recaptcha_label3|Terms of Service}'}
			</IntlFormatter>
			&nbsp;
			<IntlFormatter elementType={'span'} className={cx(bem.e('text'))}>
				{'@{recaptcha_label4|apply.}'}
			</IntlFormatter>
		</div>
	);
};

export default RecaptchaDisclaimer;
