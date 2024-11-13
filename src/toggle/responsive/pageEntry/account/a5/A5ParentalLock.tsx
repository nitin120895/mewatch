import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { A5ParentalLock as template } from 'shared/page/pageEntryTemplate';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import AccountSettingSwitch from '../common/AccountSettingSwitch';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import Spinner from 'ref/responsive/component/Spinner';
import TickIcon from 'ref/responsive/component/icons/TickIcon';
import { changePin } from 'shared/account/accountWorkflow';
import Link from 'shared/component/Link';
import CreatePinModal, { CreatePinOverlayOwnProps } from '../a1/pin/CreatePinOverlay';
import { ProfileTypes } from '../../../page/account/profile/ProfilesForm';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { ClassificationOptions } from 'shared/list/listUtil';
import { DisableProfilePlaybackGuardOptions, GetAccountUserOptions } from 'shared/service/account';
import { disableProfilePlaybackGuard, getAccount, getAccountUser } from 'shared/service/action/account';
import { isKidsProfile, getMinRatingPlaybackGuard } from 'toggle/responsive/util/profileUtil';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';

import './A5ParentalLock.scss';

const PARENTAL_LOCK_MODAL_ID = 'parental-lock';

interface A5ParentalLockOwnProps extends PageEntryPropsBase {
	editingActiveProfile?: boolean;
	profileType: ProfileTypes;
	isPrimaryProfile: boolean;
	fromProfileAdd?: boolean;
	profile: api.ProfileDetail;
	onSelectClassification: (minRatingPlaybackGuard: string, pin?: string) => {};
}

interface A5ParentalLockStateProps {
	classification?: api.Classification;
	pinEnabled: boolean;
	account: api.Account;
	classificationUrl: string;
}

interface A5ParentalLockDispatchProps {
	createPin?: (pin?: string) => Promise<any>;
	showModal: (modal: ModalConfig) => void;
	disableProfilePlaybackGuard: (
		id: string,
		body: api.ProfileDisableProfilePlaybackGuardRequest,
		options?: DisableProfilePlaybackGuardOptions,
		info?: any
	) => Promise<any>;
	getUser: typeof getAccountUser;
	getAccount: typeof getAccount;
}

type A5ParentalLockProps = A5ParentalLockOwnProps & A5ParentalLockStateProps & A5ParentalLockDispatchProps;

interface A5ParentalLockState {
	lockEnabled: boolean;
	minRatingPlaybackGuard: string;
	updateSuccess: boolean;
	loading?: boolean;
	error?: string | boolean;
	pinLoading: boolean;
	pinError?: boolean;
}

const bem = new Bem('a5');

class A5ParentalLock extends React.Component<A5ParentalLockProps, A5ParentalLockState> {
	state: A5ParentalLockState = {
		lockEnabled: false,
		minRatingPlaybackGuard: undefined,
		updateSuccess: false,
		loading: false,
		error: false,
		pinLoading: false,
		pinError: false
	};

	private successTimeout: number;
	private defaultClassification: string;

	componentDidMount() {
		const { profile, classification, profileType } = this.props;
		const defaultClassification = classification[ClassificationOptions.IMDA_M18];
		this.defaultClassification = defaultClassification ? defaultClassification.code : undefined;

		const lockEnabled = isKidsProfile(profileType) || !!(profile && profile.minRatingPlaybackGuard);
		this.setState({
			lockEnabled,
			minRatingPlaybackGuard: getMinRatingPlaybackGuard(profile)
		});
		document.addEventListener('visibilitychange', this.visibilityChange);
	}

	componentDidUpdate(prevProps: A5ParentalLockProps) {
		const { profileType } = this.props;

		if (prevProps.profileType !== profileType && isKidsProfile(profileType)) {
			this.setState({
				lockEnabled: true
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const { profileType, classification } = this.props;
		if (nextProps.profileType !== profileType && isKidsProfile(nextProps.profileType)) {
			this.setParentalLock(false, classification[ClassificationOptions.IMDA_PG].code);
		}
	}

	componentWillUnmount() {
		document.removeEventListener('visibilitychange', this.visibilityChange);
		this.clearTimeout();
	}

	private getLoadingState() {
		const { updateSuccess, loading, error } = this.state;
		if (loading) return 'pending';
		if (error) return 'error';
		if (updateSuccess) return 'success';
		return '';
	}

	visibilityChange = () => {
		if (!document.hidden) {
			const { getUser, getAccount } = this.props;
			getUser().then((_, error) => {
				if (!error) {
					getAccount();
				}
			});
		}
	};

	private onLockSwitchToggle = () => {
		const { profileType, account, showModal, profile } = this.props;
		if (isKidsProfile(profileType)) return false;
		const { lockEnabled } = this.state;
		const minRatingPlaybackGuard = lockEnabled ? '' : this.defaultClassification;

		const onSuccess = (pin?: string) => {
			this.setState({
				lockEnabled: !lockEnabled,
				pinError: false
			});

			this.setParentalLock(false, minRatingPlaybackGuard, pin);
		};

		if (!lockEnabled && account.pinEnabled && account.ageGroup !== AgeGroup.E) {
			onSuccess();
			return;
		}

		const props: CreatePinOverlayOwnProps = {
			account,
			fromParentalControl: true,
			lockEnabled,
			onSuccess,
			profile,
			id: PARENTAL_LOCK_MODAL_ID
		};

		showModal({
			id: PARENTAL_LOCK_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <CreatePinModal {...props} />,
			disableAutoClose: true
		});
	};

	private clearTimeout() {
		window.clearTimeout(this.successTimeout);
	}

	private setParentalLock(userInteract = false, minRatingPlaybackGuard = this.defaultClassification, pin?) {
		this.clearTimeout();
		if (minRatingPlaybackGuard !== this.state.minRatingPlaybackGuard) {
			const { fromProfileAdd, onSelectClassification } = this.props;

			pin = fromProfileAdd ? '' : pin;
			onSelectClassification(minRatingPlaybackGuard, pin);
			this.setState({
				minRatingPlaybackGuard,
				updateSuccess: userInteract,
				loading: false,
				error: false
			});
			return;
		}
	}

	private onRatingDropdownChange = e => {
		const value = e.target.value;
		this.clearTimeout();
		this.setState(
			{
				loading: true,
				error: false,
				updateSuccess: false
			},

			() => {
				this.successTimeout = window.setTimeout(() => this.setParentalLock(true, value), 3000);
			}
		);
	};

	render() {
		const { editingActiveProfile, isPrimaryProfile, classificationUrl, profileType } = this.props;
		const { loading, lockEnabled } = this.state;
		const isKid = isKidsProfile(profileType);

		let label = '@{account_a5_description|Restrict access to rated content (NC16, M18) via your Control PIN.}';
		if (isKid)
			label =
				'@{account_a5_description_kids_classifications|Only G and PG rated content are available for Kids Profile.}';
		if (editingActiveProfile && isPrimaryProfile)
			label =
				'@{account_a5_description_primary_profile|Restrict access to rated content (NC16, M18) via your Control PIN.}';

		return (
			<div className={bem.b()}>
				<AccountEntryWrapper {...this.props}>
					<AccountSettingSwitch
						className={bem.e('switch')}
						label={label}
						onChange={this.onLockSwitchToggle}
						checked={lockEnabled}
						disabled={loading || isKid}
						showSwitch={true}
					/>
					<Link to={classificationUrl}>
						<IntlFormatter className="classification-text" elementType="span">
							{'@{account_a5_description_classifications|Learn more about the classification of content ratings}'}
						</IntlFormatter>
					</Link>
					{this.renderRatingLockDropdown()}
				</AccountEntryWrapper>
			</div>
		);
	}

	private renderRatingLockDropdown() {
		const { lockEnabled } = this.state;
		const { classification, pinEnabled, profileType } = this.props;
		if (!classification || !lockEnabled || profileType === ProfileTypes.Kids) return false;

		return (
			<div className={bem.e('lock-level')}>
				{pinEnabled && this.renderOptions()}
				{this.renderLoadingState()}
			</div>
		);
	}

	private renderOptions() {
		const { classification } = this.props;
		const { minRatingPlaybackGuard, loading } = this.state;
		const classificationOptions = Object.keys(classification).filter(id => id !== ClassificationOptions.IMDA_R21);
		return (
			<div className={bem.e('rating-select')}>
				<select
					id="min-rating-guard"
					className={bem.e('dropdown')}
					onChange={this.onRatingDropdownChange}
					value={minRatingPlaybackGuard}
					disabled={loading}
				>
					{classificationOptions.map(id => {
						return (
							<option key={`rating-${classification[id].code}`} value={classification[id].code}>
								{classification[id].name}
							</option>
						);
					})}
				</select>
				<SVGPathIcon
					className={bem.e('arrow-icon')}
					data="M12.885.5L14.5 2.188 7.5 9.5l-7-7.313L2.115.5 7.5 6.125z"
					width="15"
					height="10"
				/>
			</div>
		);
	}

	private renderLoadingState() {
		const loadingState = this.getLoadingState();
		return (
			<div className={bem.e('loading', loadingState)}>
				<Spinner className={bem.e('loading-pending')} />
				<TickIcon className={bem.e('loading-success')} width={40} height={40} />
				{this.renderErrorTryAgain()}
			</div>
		);
	}

	private renderErrorTryAgain() {
		const { minRatingPlaybackGuard } = this.state;
		return (
			<div className={bem.e('loading-error')}>
				<div className={bem.e('error-icon')}>!</div>
				<IntlFormatter
					elementType="button"
					className={bem.e('tryagain-btn')}
					onClick={() => this.setParentalLock(true, minRatingPlaybackGuard)}
					type="button"
				>
					{'@{account_common_try_again_label|Try Again}'}
				</IntlFormatter>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): any {
	const { account, app } = state;
	const classification = app ? app.config.classification : [];
	const pinEnabled = account.info ? account.info.pinEnabled : false;
	return {
		classification,
		pinEnabled,
		account: account.info,
		classificationUrl: app.config.general.customFields.ClassificationURL
	};
}

function mapDispatchToProps(dispatch) {
	return {
		createPin: pin => dispatch(changePin('', pin)),
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		disableProfilePlaybackGuard: (
			id: string,
			body: api.ProfileDisableProfilePlaybackGuardRequest,
			options?: DisableProfilePlaybackGuardOptions,
			info?: any
		) => dispatch(disableProfilePlaybackGuard(id, body, options, info)),
		getAccount: () => dispatch(getAccount()),
		getUser: (options?: GetAccountUserOptions, info?: any) => dispatch(getAccountUser(options, info))
	};
}

const Component: any = connect<A5ParentalLockStateProps, A5ParentalLockDispatchProps, A5ParentalLockOwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(A5ParentalLock);
Component.template = template;

export default Component;
