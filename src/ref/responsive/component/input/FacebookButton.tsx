import * as React from 'react';
import * as PropTypes from 'prop-types';
import AccountButton from './AccountButton';
import IntlFormatter from '../IntlFormatter';
import FacebookIcon from '../icons/FacebookIcon';
import { Bem } from 'shared/util/styles';

import './FacebookButton.scss';

const bem = new Bem('facebook-button');

interface FacebookButtonProps {
	fbAppId: string;

	/**
	 * The facebook permissions required.
	 *
	 * See https://developers.facebook.com/docs/facebook-login/permissions
	 */
	requiredPermissions?: string[];

	/**
	 * The facebook permissions which would be nice to have but are not required.
	 *
	 * See https://developers.facebook.com/docs/facebook-login/permissions
	 */
	optionalPermissions?: string[];

	/**
	 * When true forces the user to enter their facebook credentials.
	 */
	reauthenticate?: boolean;

	/**
	 * Re-request a set of permission from the user.
	 *
	 * Useful if they don't provide the required permissions you originally requested.
	 */
	rerequest?: boolean;

	/**
	 * Request a nonce to attach to the login request.
	 */
	getNonce?: () => Promise<string>;
	/**
	 * Callback triggered when login has completed, been cancelled or failed.
	 *
	 * if `info.status === 'connected'` then login was successful.
	 *
	 * If `info.status === undefined` then login was cancelled.
	 */
	onLoginStatusChange: (info: FacebookLoginInfo) => void;

	/**
	 * Callback triggered when the Facebook single-sign-on is initiated.
	 *
	 * `onLoginStatusChange` will be called when an outcome is available
	 * or single-sign-on is cancelled.
	 */
	onLoginPending?: () => void;

	loading?: boolean;
	disabled?: boolean;
}

export interface FacebookLoginInfo {
	/**
	 * See https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
	 */
	status: 'connected' | 'not_authorized' | 'unknown';

	authResponse?: {
		accessToken: string;
		expiresIn: string;
		signedRequest: string;
		userID: string;
		missingPermissions?: string[];
	};
}

export default class FacebookButton extends React.Component<FacebookButtonProps, any> {
	static contextTypes: any = {
		store: PropTypes.object.isRequired
	};
	context: { store: Redux.Store<state.Root> };

	private script: HTMLScriptElement;

	componentDidMount() {
		this.registerSdk();
	}

	private registerSdk() {
		const { fbAppId } = this.props;
		if (!fbAppId) return;

		if (window['FB']) {
			return;
		}
		this.script = document.createElement('script');
		this.script.type = 'text/javascript';
		this.script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10&appId=${fbAppId}`;
		document.body.appendChild(this.script);
	}

	private requestNonce(): Promise<string> {
		return this.props.getNonce ? this.props.getNonce() : Promise.resolve(undefined);
	}

	private facebookLogin(nonce?: string) {
		const { requiredPermissions, optionalPermissions, reauthenticate, rerequest, onLoginPending } = this.props;
		let authType;
		if (reauthenticate) {
			authType = 'reauthenticate';
		} else if (rerequest || (requiredPermissions && requiredPermissions.length)) {
			// setting `rerequest` will have no impact if the user has previously granted
			// the permissions requested, however if they haven't then this will re-prompt
			// them to accept
			authType = 'rerequest';
		}
		const permissions = (requiredPermissions || []).concat(optionalPermissions || []);
		const options = {
			scope: permissions.join(','),
			auth_type: authType,
			nonce
		};
		if (onLoginPending) onLoginPending();
		window['FB'].login(this.onLoginStatusChange, options);
	}

	/**
	 * Facebook does not allow the definition of required permission.
	 * Instead any requested permission may be opted out of by a user.
	 *
	 * Some permissions may be required in order for the app to run,
	 * (e.g. `email`) so we add a check here to ensure all required
	 * permissions have been granted. If not we surface a `missingPermissions`
	 * array under `info.authResponse.missingPermissions`.
	 *
	 * Remember that even if some permissions are missing the user will
	 * still be connected to Facebook. It's up to the app to ask the user
	 * to Facebook login again with the permissions needed.
	 *
	 * See https://developers.facebook.com/docs/facebook-login/permissions/requesting-and-revoking
	 */
	private checkGrantedPermissions(info: FacebookLoginInfo): Promise<FacebookLoginInfo> {
		const { requiredPermissions } = this.props;
		if (!info.authResponse || !requiredPermissions || !requiredPermissions.length) {
			return Promise.resolve(info);
		}

		return new Promise(resolve => {
			window['FB'].api('/me/permissions', 'get', {}, res => {
				const status = (res.data || []).reduce((status, entry) => {
					status[entry.permission] = entry.status;
					return status;
				}, {});
				const missing = requiredPermissions.filter(p => status[p] !== 'granted');
				if (missing.length) {
					info.authResponse.missingPermissions = missing;
				}
				resolve(info);
			});
		});
	}

	private onLoginStatusChange = (info: FacebookLoginInfo) => {
		this.checkGrantedPermissions(info).then(this.props.onLoginStatusChange);
	};

	private onClick = () => {
		if (!window['FB']) return;
		this.requestNonce().then(nonce => this.facebookLogin(nonce));
	};

	render() {
		const { fbAppId, loading, disabled } = this.props;
		if (!fbAppId) return false;
		return (
			<AccountButton
				ordinal="custom"
				onClick={this.onClick}
				loading={loading}
				disabled={disabled}
				className={bem.b()}
				large
			>
				<div className={bem.e('button-content')}>
					<FacebookIcon width={20} height={24} />
					<IntlFormatter className="text">{'@{form_signIn_facebookButton_label|Sign in with Facebook}'}</IntlFormatter>
				</div>
			</AccountButton>
		);
	}
}
