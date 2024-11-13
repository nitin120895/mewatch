import * as React from 'react';
import * as cx from 'classnames';
import { browserHistory } from 'shared/util/browserHistory';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../../component/modal/CloseIcon';
import { connect } from 'react-redux';
import { CloseModal, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import CtaButton from 'ref/responsive/component/CtaButton';
import { getUpdatedItem } from 'toggle/responsive/page/item/itemUtil';
import {
	redirectToSubscriptions,
	redirectToSignPage
} from 'toggle/responsive/pageEntry/subscription/subscriptionsUtils';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import TextInput from 'toggle/responsive/component/input/TextInput';
import { getItemChildrenList } from 'shared/service/action/content';
import { get } from 'shared/util/objects';
import {
	getRestrictedModalForAnonymous,
	getSignInRequiredModalForAnonymous
} from 'toggle/responsive/player/playerModals';
import {
	onPlayerSignIn,
	onPlayerSignUp,
	isItemRestricted,
	isContentProviderCeased
} from 'toggle/responsive/util/playerUtil';
import { formDisplayState } from '../../account/ssoValidationUtil';
import { canPlay, isRegistrationOnlyRequired } from 'ref/responsive/pageEntry/util/offer';
import {
	SUBSCRIPTION_REQUIRED_MODAL_ID,
	subscriptionRequiredModal,
	SubscriptionsModalProps,
	UpsellModalProps,
	upsellModal,
	upsellCessationModal,
	UPSELL_CESSATION_MODAL
} from 'toggle/responsive/util/subscriptionUtil';

import './JumpToEpisodeModal.scss';

const bem = new Bem('jump-to-episode');

export interface JumpToEpisodeModalOwnProps {
	id: string;
	itemId: string;
}

interface JumpToEpisodeModalStateProps {
	accountActive: boolean;
	config: api.AppConfig;
}

interface JumpToEpisodeModalDispatchProps {
	getItemChildrenList: (id: string, options: any) => Promise<any>;
	openModal: (modal: ModalConfig) => void;
	getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
	getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => void;
}

type Props = JumpToEpisodeModalOwnProps &
	ModalManagerDispatchProps &
	JumpToEpisodeModalDispatchProps &
	JumpToEpisodeModalStateProps;

interface State {
	inputText: string;
	displayState: form.DisplayState;
	message: string;
	disabled: boolean;
}

class JumpToEpisodeModal extends React.Component<Props, State> {
	state: State = {
		displayState: formDisplayState.DEFAULT,
		inputText: '',
		message: '',
		disabled: true
	};

	private container: HTMLElement;

	modalRef = node => {
		this.container = node;
	};

	componentDidMount() {
		window.addEventListener('click', this.handleOverlayClick, true);
		this.enableInputField();
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.handleOverlayClick);
	}

	enableInputField() {
		setTimeout(() => {
			this.setState({
				disabled: false
			});
		}, 0);
	}

	handleOverlayClick = e => {
		if (this.container && !this.container.contains(e.target)) {
			this.setState({
				disabled: true
			});
		}
	};

	setError = (isInvalid: boolean) => {
		this.setState({
			displayState: isInvalid ? formDisplayState.ERROR : formDisplayState.DEFAULT,
			message: isInvalid ? '@{itemDetail_episode_range_jump_to_episode_error|Episode not found}' : ''
		});
	};

	onInputChange = e => {
		const inputText = e.target.value;
		const regexp = /^\d*$/;
		const result = regexp.exec(inputText);
		this.setState({ inputText });

		if (inputText && result) {
			const input: number = result.length ? Number(result[0]) : undefined;
			const isInvalid = (!input || input < 0) && inputText;
			this.setError(isInvalid);
			return;
		}
		this.setError(!!inputText);
	};

	onContinueClick = () => {
		const { inputText, displayState } = this.state;

		if (displayState !== formDisplayState.ERROR && inputText) {
			const { getItemChildrenList, itemId } = this.props;
			const episodeNumber = Number(inputText);

			getItemChildrenList(itemId, { pageSize: 1, episodeNumber }).then(data => {
				const items = get(data, 'payload.items');
				if (items && items.length) {
					this.onCloseClick();
					getUpdatedItem(items[0].id).then(updatedItem => this.doOfferBasedAction(updatedItem));
				} else {
					this.setError(true);
				}
			});
			return;
		}
	};

	doOfferBasedAction(episode: api.ItemDetail) {
		const { accountActive } = this.props;

		const registrationOnlyRequired = isRegistrationOnlyRequired(episode);
		if (!accountActive && canPlay(episode) && !registrationOnlyRequired) {
			browserHistory.push(episode.watchPath);
			return;
		}

		if (!accountActive && !registrationOnlyRequired) {
			isContentProviderCeased(episode) ? this.showCessationUpsellModal(episode) : this.showUpsellModal(episode);
			return;
		}

		if (canPlay(episode)) {
			browserHistory.push(episode.watchPath);
			return;
		}

		if (!accountActive && registrationOnlyRequired) {
			this.showSignInRequiredModal(episode);
			return;
		}

		isContentProviderCeased(episode)
			? this.showCessationUpsellModal(episode)
			: this.showSubscriptionRequiredModal(episode);
	}

	showSignInRequiredModal = (episode: api.ItemDetail) => {
		const { getRestrictedContentModalForAnonymous, getSignInRequiredModalForAnonymous } = this.props;
		// Handles display of modals for anon user for free + sign in required content
		if (isItemRestricted(episode)) {
			getRestrictedContentModalForAnonymous(() => onPlayerSignIn(), () => onPlayerSignUp());
		} else {
			getSignInRequiredModalForAnonymous(() => onPlayerSignIn(), () => onPlayerSignUp());
		}
	};

	onSignInRequiredConfirm = (episode: api.ItemDetail) => {
		const { closeModal, config } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		redirectToSignPage(config, episode.watchPath);
	};

	showUpsellModal = (item: api.ItemDetail) => {
		const upsellModalProps: UpsellModalProps = {
			onSubscribe: () => this.onSubscribe(item),
			onSignIn: () => this.onSignIn()
		};

		this.props.openModal(upsellModal(upsellModalProps));
	};

	private showCessationUpsellModal = (episode: api.ItemDetail) => {
		const { accountActive, openModal } = this.props;
		const upsellModalProps: UpsellModalProps = accountActive
			? { onSubscribe: () => this.onCessationCancelClick() }
			: {
					onSubscribe: () => this.onCessationCancelClick(),
					onSignIn: () => this.onSignIn()
			  };
		const provider = get(episode, 'customFields.Provider');
		openModal(upsellCessationModal(upsellModalProps, provider));
	};

	showSubscriptionRequiredModal = (item: api.ItemDetail) => {
		const { openModal } = this.props;

		const props: SubscriptionsModalProps = {
			onConfirm: () => this.onSubscribe(item),
			target: 'app',
			isSignedInUser: true
		};

		openModal(subscriptionRequiredModal(props));
	};

	onSubscribe = (item: api.ItemDetail) => {
		redirectToSubscriptions(item, this.props.config);
	};

	private onCessationCancelClick = () => {
		const { closeModal } = this.props;
		closeModal(UPSELL_CESSATION_MODAL);
	};

	onConfirm = (item: api.ItemDetail) => {
		const { closeModal, accountActive } = this.props;
		closeModal(SUBSCRIPTION_REQUIRED_MODAL_ID);

		if (accountActive) {
			return this.onSubscribe(item);
		}

		return this.onSignIn();
	};

	onSignIn = () => {
		redirectToSignPage(this.props.config);
	};

	onCloseClick = () => {
		const { closeModal, id } = this.props;
		this.setState(
			{
				disabled: true
			},
			() => closeModal(id)
		);
	};

	render() {
		const { inputText, displayState, message, disabled } = this.state;
		return (
			<div className={bem.b()} ref={this.modalRef}>
				<div className={cx(bem.e('modal'), 'form-white')}>
					<div className={bem.e('close')} onClick={this.onCloseClick}>
						<CloseIcon />
					</div>

					<div className={bem.e('title')}>
						<IntlFormatter elementType="span">
							{'@{itemDetail_episode_range_jump_to_episode|Jump to Episode}'}
						</IntlFormatter>
					</div>
					<TextInput
						id="episode-number"
						name="episode-number"
						type="tel"
						className={bem.e('input')}
						label="@{itemDetail_episode_range_jump_to_episode_placeholder|Enter episode}"
						value={inputText}
						onChange={this.onInputChange}
						displayState={displayState}
						required={true}
						message={message}
						disabled={disabled}
					/>
					<div>
						<CtaButton
							className={bem.e('button')}
							ordinal="primary"
							disabled={!!message}
							onClick={this.onContinueClick}
						>
							<IntlFormatter>{'@{profileSelector_title_pin_submit|Continue}'}</IntlFormatter>
						</CtaButton>

						<CtaButton className={bem.e('button')} ordinal="secondary" onClick={this.onCloseClick}>
							<IntlFormatter>{'@{profileSelector_title_pin_cancel|Cancel}'}</IntlFormatter>
						</CtaButton>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): JumpToEpisodeModalStateProps {
	return {
		accountActive: !!state.account.info,
		config: state.app.config
	};
}

function mapDispatchToProps(dispatch): ModalManagerDispatchProps & JumpToEpisodeModalDispatchProps {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id)),
		getItemChildrenList: (id: string, options: any) => dispatch(getItemChildrenList(id, options)),
		openModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		getRestrictedContentModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => {
			dispatch(OpenModal(getRestrictedModalForAnonymous(onSignIn, onSignUp)));
		},
		getSignInRequiredModalForAnonymous: (onSignIn: () => void, onSignUp: () => void) => {
			dispatch(OpenModal(getSignInRequiredModalForAnonymous(onSignIn, onSignUp)));
		}
	};
}

export default connect<JumpToEpisodeModalStateProps, ModalManagerDispatchProps, JumpToEpisodeModalOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(JumpToEpisodeModal);
