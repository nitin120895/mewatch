import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';

import { resolveVerticalSpacingClassNames } from 'ref/responsive/pageEntry/util/custom';

import { getAccount } from 'shared/account/accountUtil';
import { encryptSSOToken } from 'shared/mcSSOService/action/mcSSOAuthorization';
import { X2WebView as TemplateKey } from 'shared/page/pageEntryTemplate';
import { setRedirectPathAfterSignin } from 'shared/page/pageUtil';
import { getSignInPath } from 'shared/page/sitemapLookup';
import { Register as registerPageKey } from 'shared/page/pageKey';
import { OpenModal, CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { Bem } from 'shared/util/styles';
import { decodeJwt, findToken } from 'shared/util/tokens';
import { browserHistory } from 'shared/util/browserHistory';
import { addQueryParameterToURL, QueryParams } from 'shared/util/urls';

import {
	getSignInRequiredModalAnonymousForCampaigns,
	getVotingRequiredModal
} from 'toggle/responsive/player/playerModals';
import {
	redirectToRegisterPage,
	redirectToSignPage
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';

import EntryTitle from 'ref/responsive/component/EntryTitle';
import { getPagePathByKey } from 'shared/component/Link';
import Spinner from 'ref/responsive/component/Spinner';

import './X2WebView.scss';

interface CustomFields {
	link?: string;
	widthPercentage?: number;
	imageWidth?: customFields.ImageLayoutPosition;
	imageHorizontalAlignment?: position.AlignX;
	imageVerticalSpacing?: customFields.ImageVerticalSpacing;
	aspectRatio?: customFields.AspectRatio;
	pixelHeight?: number;
	customTagline?: string;
}

export interface X2PageEntryProps extends TPageEntryPropsBase<CustomFields> {
	// These properties aren't utilised by scheduled X2 page entries, but are optionally
	// utilised by scheduled X3 page entries which instantiate an X2 instance.
	height?: number;
	onLinkChange?: () => void;
}

interface StateProps {
	config: api.AppConfig;
	ssoToken: string;
	ssoTokenEnc: string;
	ssoTokenEncError: boolean;
	profile: state.Profile;
}

interface DispatchProps {
	getRequiredModal?: (onSignIn: () => void, onSignUp: () => void, onClose?: () => void) => void;
	encryptSSOToken?: (token: string) => void;
	getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void) => void;
	closeModal: (id: string) => void;
}

type ComponentProps = X2PageEntryProps & DispatchProps & StateProps;

interface ComponentState {
	promptKey: number;
}

const MESSAGE_PROMPT_LOGIN = 'REQUIRES_LOGIN';
const bemX2 = new Bem('x2');
const bemCfVspacing = new Bem('cf-vspacing');
const bemSfAp = new Bem('cf-ap');
const REQUIRE_MODAL_ID = 'required-modal';

class X2WebView extends React.Component<ComponentProps, ComponentState> {
	private container: HTMLElement;
	private isSSOTokenRequired: boolean;
	private trackingPostMessage: boolean;

	constructor(props: ComponentProps) {
		super(props);
		this.isSSOTokenRequired = this.isSSOTokenDomain();
		this.trackingPostMessage = false;
		this.state = { promptKey: 0 };
	}

	componentDidMount() {
		this.updateStyles();

		const iframe = this.container.querySelector('iframe');
		iframe && iframe.setAttribute('allow', 'encrypted-media');

		if (this.isSSOTokenRequired) {
			if (getAccount()) {
				const { ssoTokenEnc } = this.props;
				!ssoTokenEnc && this.acquireEncryptedToken();
			} else {
				if (this.pageRequiresSignIn()) {
					this.showSignInRequiredModal();
				}
				window.addEventListener('message', this.onMessage, false);
				this.trackingPostMessage = true;
			}
		}
	}

	componentWillUnmount() {
		if (this.trackingPostMessage) {
			window.removeEventListener('message', this.onMessage);
		}
	}

	componentWillReceiveProps(nextProps: ComponentProps) {
		const { customFields, height, ssoToken } = this.props;
		const { customFields: nextCustomFields, onLinkChange, ssoToken: nextssoToken } = nextProps;
		if (customFields && nextCustomFields) {
			if (customFields.link !== nextCustomFields.link) {
				if (height > 0) {
					// Clear existing props height prior to rendering new props
					/* tslint:disable:no-null-keyword */
					this.container.style.height = null;
					/* tslint:enable */
				}
				this.isSSOTokenRequired = this.isSSOTokenDomain();
				if (onLinkChange) onLinkChange();
			}
			if (getAccount() && ssoToken !== nextssoToken) {
				this.acquireEncryptedToken();
			}
		}
	}

	componentDidUpdate(prevProps: X2PageEntryProps, prevState: any) {
		const { customFields, height } = this.props;
		const { customFields: prevCustomFields, height: prevHeight } = prevProps;
		if (customFields !== prevCustomFields || height !== prevHeight) {
			this.updateStyles();
			this.isSSOTokenRequired = this.isSSOTokenDomain();
		}
	}

	private getVerticalSpacing() {
		const { imageVerticalSpacing } = this.props.customFields;
		return resolveVerticalSpacingClassNames(imageVerticalSpacing);
	}

	private updateStyles() {
		if (this.container) {
			const { height: propsHeight } = this.props;
			const {
				imageWidth,
				widthPercentage,
				imageHorizontalAlignment,
				aspectRatio,
				pixelHeight
			} = this.props.customFields;
			/* tslint:disable:no-null-keyword */
			if (imageWidth === 'widthPercentage') {
				this.container.style.width = `${widthPercentage}%`;
				let offset = 0;
				switch (imageHorizontalAlignment) {
					case 'left':
						offset = 0;
						break;
					case 'center':
						offset = (100 - widthPercentage) / 2;
						break;
					case 'right':
						offset = offset = 100 - widthPercentage;
						break;
				}
				this.container.style.right = offset ? `-${offset}%` : null;
			} else {
				this.container.style.width = null;
				this.container.style.right = null;
			}
			if (aspectRatio === 'pixels') {
				this.container.style.height = `${pixelHeight}px`;
			} else {
				this.container.style.height = null;
			}
			/* tslint:enable */
			if (propsHeight > 0) {
				this.container.style.height = `${propsHeight}px`;
			}
		}
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private onMessage = e => {
		if (e.origin.indexOf(process.env.CLIENT_WEBVIEW_SSO_TOKEN_DOMAIN) > -1) {
			if (e.data === MESSAGE_PROMPT_LOGIN) {
				const { ssoToken, getRequiredModal, config, location } = this.props;
				const redirectPath = location.pathname;
				!ssoToken &&
					getRequiredModal(
						() => {
							setRedirectPathAfterSignin(redirectPath);
							redirectToSignPage(config);
						},
						() => {
							setRedirectPathAfterSignin(redirectPath);
							redirectToRegisterPage(config);
						},
						() => {
							const { promptKey } = this.state;
							this.setState({ promptKey: promptKey + 1 });
						}
					);
			}
		}
	};

	private isSSOTokenDomain() {
		const { customFields } = this.props;
		if (customFields.link && process.env.CLIENT_WEBVIEW_SSO_TOKEN_DOMAIN) {
			const url = new URL(customFields.link);
			return url.hostname.indexOf(process.env.CLIENT_WEBVIEW_SSO_TOKEN_DOMAIN) > -1;
		}
	}

	private acquireEncryptedToken() {
		const { ssoToken, encryptSSOToken } = this.props;
		if (ssoToken) {
			encryptSSOToken(ssoToken);
		}
	}

	private showSignInRequiredModal = () => {
		const { getSignInRequiredModal, config } = this.props;
		const path = getPagePathByKey(config, `@${registerPageKey}`);
		getSignInRequiredModal(this.onSignInRequiredConfirm, () => browserHistory.push(path));
	};

	private onSignInRequiredConfirm = () => {
		const { closeModal, config } = this.props;
		closeModal(REQUIRE_MODAL_ID);
		browserHistory.push(`/${getSignInPath(config)}`);
	};

	private pageRequiresSignIn = () => {
		const { customFields } = this.props;
		const url = customFields && customFields.link;
		const isSSO = url && url.includes('sso=true');
		return isSSO;
	};

	render() {
		const { template, height: propsHeight, customFields, className } = this.props;
		const hasExternalHeight = propsHeight > 0;
		const isFullWidth = customFields.imageWidth === 'fullWidth';
		const verticalSpacingModifier = this.getVerticalSpacing();
		const displayEntryTitle = !~verticalSpacingModifier.indexOf('flush-top');
		const templateName = template !== TemplateKey ? template.toLowerCase() : '';
		const classes = cx(
			bemX2.b(),
			!hasExternalHeight ? bemCfVspacing.b(verticalSpacingModifier) : '',
			templateName,
			className
		);
		const iFrameJsx = this.renderIframe(hasExternalHeight, customFields, templateName);
		return (
			<div className={classes}>
				{displayEntryTitle && <EntryTitle {...this.props} />}
				{isFullWidth ? <div className="full-bleed">{iFrameJsx}</div> : iFrameJsx}
			</div>
		);
	}

	renderIframe(hasExternalHeight, customFields, templateName) {
		/* tslint:disable-next-line:no-null-keyword */
		if (_SSR_) return null;

		const { link, aspectRatio } = customFields;
		const fixedHeight = aspectRatio === 'pixels';
		const iFrameClasses = cx(bemX2.e('frame'), fixedHeight || hasExternalHeight ? undefined : bemSfAp.b(aspectRatio));

		let src = link;
		const { ssoTokenEnc, ssoTokenEncError } = this.props;
		if (this.isSSOTokenRequired) {
			if (getAccount() && ssoTokenEnc) {
				const queryParams: QueryParams = { vtgto: ssoTokenEnc };
				src = addQueryParameterToURL(link, queryParams);
			}
		}

		const shouldShowSpinner = this.isSSOTokenRequired && getAccount() && !ssoTokenEnc && !ssoTokenEncError;
		return (
			<div className={iFrameClasses} ref={this.onContainerRef}>
				{shouldShowSpinner ? (
					<div className={bemX2.e('spinner')} key="spinner">
						<Spinner />
					</div>
				) : (
					<iframe
						className="x2-iframe"
						src={src}
						frameBorder={0}
						allowFullScreen={true}
						name={templateName || 'x2'}
						scrolling="yes"
						key={this.state.promptKey}
					/>
				)}
			</div>
		);
	}
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		getRequiredModal: (onSignIn: () => void, onSignup: () => void, onClose?: () => void) =>
			dispatch(OpenModal(getVotingRequiredModal(onSignIn, onSignup, onClose))),
		encryptSSOToken: token => dispatch(encryptSSOToken(token)),
		getSignInRequiredModal: (onSignIn: () => void, onSIgnUp: () => void) => {
			dispatch(OpenModal(getSignInRequiredModalAnonymousForCampaigns(onSignIn, onSIgnUp)));
		},
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

function mapStateToProps({ app, uiLayer, session, page, profile }: state.Root): StateProps {
	const token = session && findToken(session.tokens, 'UserAccount', 'Catalog');
	const ssoToken = token && decodeJwt(token).ssoToken;
	return {
		config: app.config,
		profile,
		ssoToken,
		ssoTokenEnc: session.ssoTokenEnc,
		ssoTokenEncError: session.ssoTokenEncError
	};
}

const Component: any = connect<StateProps, DispatchProps, X2PageEntryProps>(
	mapStateToProps,
	mapDispatchToProps
)(X2WebView);
Component.template = TemplateKey;

export default Component;
