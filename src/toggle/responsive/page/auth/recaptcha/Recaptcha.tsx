import * as React from 'react';

declare global {
	interface Window {
		grecaptcha: any;
	}
}

export interface RecaptchaProps extends React.HTMLProps<any> {
	siteKey: string;
	dataSize?: string;
	dataType?: string;
	callback: any;
	id: string;
}
/**
 * Call to Action recaptcha.
 */
export default class Recaptcha extends React.Component<RecaptchaProps, any> {
	componentDidMount(): void {
		const { id, siteKey, callback, dataSize, dataType } = this.props;

		// refer this link  https://developers.google.com/recaptcha/docs/loading
		if (typeof window.grecaptcha === 'undefined') {
			window.grecaptcha = {};
		}

		window.grecaptcha.ready = function(cb) {
			if (typeof window.grecaptcha === 'undefined') {
				// window.__grecaptcha_cfg is a global variable that stores reCAPTCHA's
				// configuration. By default, any functions listed in its 'fns' property
				// are automatically executed when reCAPTCHA loads.
				const c = '___grecaptcha_cfg';
				window[c] = window[c] || {};
				(window[c]['fns'] = window[c]['fns'] || []).push(cb);
			} else {
				cb();
			}
		};

		window.grecaptcha.ready(function() {
			try {
				window.grecaptcha.render(id, {
					sitekey: siteKey,
					callback: callback,
					size: dataSize ? dataSize : '',
					type: dataType ? dataType : ''
				});
			} catch (e) {
				window.grecaptcha.reset();
			}
		});
	}

	render() {
		return <div id={this.props.id} className="g-recaptcha" />;
	}
}
