import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'shared/util/browserHistory';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import { Bem } from 'shared/util/styles';
import { HideAllModals } from 'shared/uiLayer/uiLayerWorkflow';
import { getItemWithCacheCreator } from 'shared/util/itemUtils';
import { Home as homePageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { get } from 'shared/util/objects';
import { resolveItemImage } from 'toggle/responsive/util/epg';
import {
	redirectToSignPage,
	redirectToSubscriptions,
	getUserActionRequirement,
	USER_REQUIREMENT
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { onPlayerSignUp, isContentProviderCeased } from 'toggle/responsive/util/playerUtil';
import {
	getCessationPopUpAnonymousMessage,
	getCessationPopUpSignInMessage,
	getProviderGroupName
} from 'toggle/responsive/util/subscriptionUtil';

import './SubscriptionOverlay.scss';

enum ButtonType {
	Primary = 'primary',
	Secondary = 'secondary'
}

const bem = new Bem('entitled-overlay');

interface OwnProps {
	item?: api.ItemDetail;
}

interface DispatchProps extends ModalManagerDispatchProps {
	hideAllModals?: () => void;
}

interface StateProps {
	config: state.Config;
	activeAccount: boolean;
	isModalActive?: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class SubscriptionOverlay extends React.Component<Props> {
	getItemWithCache = getItemWithCacheCreator();

	async getUpdatedItem() {
		const id = get(this.props, 'item.id');
		if (!id) return;

		return await this.getItemWithCache(id);
	}

	onSubscribeClick = () => {
		const { config, hideAllModals } = this.props;
		hideAllModals();

		this.getUpdatedItem().then(updatedItem => {
			redirectToSubscriptions(updatedItem, config);
		});
	};

	onCessationCancelClick = () => {
		const { config } = this.props;
		const homePageUrl = getPathByKey(homePageKey, config);
		browserHistory.push(homePageUrl);
	};

	onSignInClick = () => {
		const { config, hideAllModals } = this.props;
		hideAllModals();

		this.getUpdatedItem().then(updatedItem => {
			redirectToSignPage(config, updatedItem.path);
		});
	};

	private getUserAction = (): USER_REQUIREMENT => {
		const { item, activeAccount } = this.props;
		return getUserActionRequirement(activeAccount, item);
	};

	private getCessationProviderDetails = (config, item: api.ItemDetail) => {
		const provider = get(item, 'customFields.Provider');
		const providerGroupName = getProviderGroupName(config, provider);
		return { providerGroupName };
	};

	private renderUpsellText() {
		const { item, activeAccount, config } = this.props;
		// Get the cessation provider details from config api
		const { providerGroupName } = this.getCessationProviderDetails(config, item);
		let { cessationTitle: cessationUpsellModalTitle } = getCessationPopUpAnonymousMessage(config, providerGroupName);
		let { cessationTitle: cessationUpsellSubscribeModalTitle } = getCessationPopUpSignInMessage(
			config,
			providerGroupName
		);

		if (!isContentProviderCeased(item)) {
			return '@{channel_details_subscribe_modal_title|This programme is available to paid subscribers only.}';
		} else if (isContentProviderCeased(item) && activeAccount) {
			return cessationUpsellSubscribeModalTitle;
		} else {
			return cessationUpsellModalTitle;
		}
	}

	private renderText(userAction) {
		const { item } = this.props;
		const shouldRenderUpsellOverlay = userAction === USER_REQUIREMENT.UPSELL;
		const itemImageSrc = (resolveItemImage(item) && resolveItemImage(item)[0].src) || '';

		return (
			<div>
				{!shouldRenderUpsellOverlay && <img src={itemImageSrc} alt="" />}
				{userAction === USER_REQUIREMENT.SIGNIN_REQUIRED ? (
					<IntlFormatter elementType="div" className={bem.e('subscription', 'title')}>
						{
							'@{restricted_content_for_anonymous|Sign in to watch for free. If you do not have an account, please create one.}'
						}
					</IntlFormatter>
				) : (
					<IntlFormatter elementType="div" className={bem.e('subscription', 'title')}>
						{this.renderUpsellText()}
					</IntlFormatter>
				)}
				{this.renderModalMessage(userAction)}
			</div>
		);
	}

	private renderUpsellMessage() {
		const { item, activeAccount, config } = this.props;
		// Get the cessation provider details from config api
		const { providerGroupName } = this.getCessationProviderDetails(config, item);
		const { cessationMessage: cessationUpsellModalDescription } = getCessationPopUpAnonymousMessage(
			config,
			providerGroupName
		);
		const { cessationMessage: cessationUpsellSubscribeModalDescription } = getCessationPopUpSignInMessage(
			config,
			providerGroupName
		);

		if (!isContentProviderCeased(item)) {
			return '@{channel_details_upsel_modal_message|If you are a subscriber, please sign in.}';
		} else if (isContentProviderCeased(item) && activeAccount) {
			return cessationUpsellSubscribeModalDescription;
		} else {
			return cessationUpsellModalDescription;
		}
	}

	private renderModalMessage(userAction: USER_REQUIREMENT) {
		const { item, config } = this.props;
		const { providerGroupName } = this.getCessationProviderDetails(config, item);
		const { cessationMessage: cessationUpsellSubscribeModalDescription } = getCessationPopUpSignInMessage(
			config,
			providerGroupName
		);

		switch (userAction) {
			case USER_REQUIREMENT.UPSELL:
				return (
					<IntlFormatter
						elementType="div"
						className={
							isContentProviderCeased(item)
								? bem.e('subscription', 'text', 'cessation-text')
								: bem.e('subscription', 'text')
						}
					>
						{this.renderUpsellMessage()}
					</IntlFormatter>
				);
			case USER_REQUIREMENT.SIGNIN_REQUIRED:
				return (
					<IntlFormatter elementType="div" className={bem.e('subscription', 'text')}>
						{'@{require_modal_description|This feature is available when you sign in.}'}
					</IntlFormatter>
				);
			case USER_REQUIREMENT.SUBSCRIPTION_REQUIRED:
				return (
					<IntlFormatter elementType="div" className={bem.e('subscription', 'text')}>
						{!isContentProviderCeased(item)
							? '@{channel_details_subscribe_modal_message|This content is available to paid subscribers only.}'
							: cessationUpsellSubscribeModalDescription}
					</IntlFormatter>
				);
			default:
				return;
		}
	}

	private renderButtons(userAction) {
		const { activeAccount, item } = this.props;

		switch (userAction) {
			case USER_REQUIREMENT.UPSELL:
				return (
					<span>
						{isContentProviderCeased(item) ? (
							<IntlFormatter
								elementType={CtaButton}
								onClick={this.onCessationCancelClick}
								componentProps={{
									ordinal: 'secondary',
									className: bem.e('subscribe-section', 'cta')
								}}
							>
								{'Cancel'}
							</IntlFormatter>
						) : (
							<IntlFormatter
								elementType={CtaButton}
								onClick={this.onSubscribeClick}
								componentProps={{
									ordinal: 'primary',
									className: bem.e('subscribe-section', 'cta')
								}}
							>
								{'@{subscriptions_subscribe_section_subscribe|Subscribe}'}
							</IntlFormatter>
						)}
						<IntlFormatter
							elementType={CtaButton}
							onClick={this.onSignInClick}
							componentProps={{
								theme: 'light',
								ordinal: isContentProviderCeased(item) ? ButtonType.Primary : ButtonType.Secondary,
								className: bem.e('subscribe-section', 'cta')
							}}
						>
							{'@{nav_signIn_label|Sign In}'}
						</IntlFormatter>
					</span>
				);
			case USER_REQUIREMENT.SIGNIN_REQUIRED:
				return (
					<span>
						<IntlFormatter
							elementType={CtaButton}
							onClick={this.onSignInClick}
							componentProps={{
								ordinal: 'primary',
								className: bem.e('subscribe-section', 'cta')
							}}
						>
							{'@{nav_signIn_label|Sign In}'}
						</IntlFormatter>
						<IntlFormatter
							elementType={CtaButton}
							onClick={() => onPlayerSignUp(item && item.path)}
							componentProps={{
								theme: 'light',
								ordinal: 'secondary',
								className: bem.e('subscribe-section', 'cta')
							}}
						>
							{'@{form_register_createAccount_label|Create Account}'}
						</IntlFormatter>
					</span>
				);
			case USER_REQUIREMENT.SUBSCRIPTION_REQUIRED:
				return (
					<span>
						{isContentProviderCeased(item) ? (
							<IntlFormatter
								elementType={CtaButton}
								onClick={activeAccount ? this.onCessationCancelClick : this.onSignInClick}
								componentProps={{
									ordinal: 'primary',
									className: bem.e('subscribe-section', 'cta')
								}}
							>
								{activeAccount ? '@{cessation_upsell_ok}' : '@{nav_signIn_label|Sign In}'}
							</IntlFormatter>
						) : (
							<IntlFormatter
								elementType={CtaButton}
								onClick={activeAccount ? this.onSubscribeClick : this.onSignInClick}
								componentProps={{
									ordinal: 'primary',
									className: bem.e('subscribe-section', 'cta')
								}}
							>
								{activeAccount
									? '@{subscriptions_subscribe_section_subscribe|Subscribe}'
									: '@{nav_signIn_label|Sign In}'}
							</IntlFormatter>
						)}
					</span>
				);
			default:
				return;
		}
	}

	render() {
		const { activeAccount } = this.props;
		const userAction = this.getUserAction();
		return (
			<div className={bem.b(!activeAccount && 'upsell')}>
				{this.renderText(userAction)}
				{this.renderButtons(userAction)}
			</div>
		);
	}
}

function mapStateToProps({ app, account, uiLayer }: state.Root): StateProps {
	const appModal = get(uiLayer, 'modals.app');
	return {
		config: app.config,
		activeAccount: account.active,
		isModalActive: appModal && appModal.length
	};
}

function mapDispatchToProps(dispatch): DispatchProps {
	return {
		hideAllModals: () => dispatch(HideAllModals())
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(SubscriptionOverlay);
