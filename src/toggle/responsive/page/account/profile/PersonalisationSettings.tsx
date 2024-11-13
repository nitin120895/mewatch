import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { ConfirmationDialogProps } from 'ref/responsive/component/dialog/ConfirmationDialog';
import CtaButton from 'ref/responsive/component/CtaButton';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';
import { getList } from 'shared/service/action/content';
import { Genre as genreId } from 'shared/list/listId';
import * as content from 'shared/service/content';

import { selectFullName, selectPersonalisationGenreListId } from 'shared/selectors/personalisation';
import { Home, Account, AccountProfileEdit } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { ShowPassiveNotification, OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import { UpdateRecommendationSettingsOptions } from 'shared/service/account';
import { updateRecommendationSettings } from 'shared/service/action/account';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { browserHistory } from 'shared/util/browserHistory';
import { noop } from 'shared/util/function';
import { analyticsEvent } from 'shared/analytics/analyticsWorkflow';
import { AnalyticsEventType } from 'shared/analytics/types/v3/event/analyticsEvent';

import { getProfileSegment } from 'shared/selectors/personalisation';
import { get } from 'shared/util/objects';
import { getProfileById } from 'shared/selectors/personalisation';
import { PersonalisationModalCta, pageSize } from 'toggle/responsive/util/PersonalisationUtil';
import PersonalisationCategories from './PersonalisationCategories';
import PersonalisationItemSelection from './PersonsalisationItemSelection';
import { setRecommendationSettings } from 'shared/account/accountWorkflow';
import { getAccountProfileEditPath } from 'shared/account/profileUtil';
import {
	BOOST_WIDGET_COLD_START_EOP_WEB,
	getBoostRecommendations,
	getZoomRecommendations,
	ZOOM_WIDGET_COLD_START_EOP_WEB
} from 'shared/list/listUtil';

import './PersonalisationSettings.scss';

export enum PersonalisationSteps {
	CategorySelection = 'CategorySelection',
	ContentSelection = 'ContentSelection'
}

interface State {
	categories: api.ItemList[];
	selectedCategories: string[];
	boostWidgetId: string;
	zoomWidgetId: string;
	step: PersonalisationSteps;
	recommendations: api.ItemDetail[];
	selectedItems: api.ItemDetail[];
	hasError: boolean;
	scrollable: boolean;
	totalPage: number;
	refUsecase: string;
	listData: object;
}

interface StateProps {
	listId: string;
	fullName: string;
	profile: api.ProfileSummary;
	homePath: string;
	accountPath: string;
	accountEditPath: string;
	selectedCategories: string[];
	isPrimary: boolean;
}

interface OwnProps {
	coldStart?: boolean;
	profileManagement?: boolean;
	profileId?: string;
}

interface DispatchProps {
	getGenreList: (listId: string) => Promise<any>;
	getBoostRecommendations: (widgetId: string, options?: content.GetBoostRecommendationsListOptions) => Promise<any>;
	getZoomRecommendations: (widgetId: string, options?: content.GetZoomRecommendationsListOptions) => Promise<any>;
	showPassiveNotification: (config: PassiveNotificationConfig) => Promise<any>;
	updateRecommendationSettings: (
		id: string,
		body: api.RecommendationSettingsUpdateRequest,
		options?: UpdateRecommendationSettingsOptions,
		info?: any
	) => Promise<any>;
	showModal: (modalConfig: ModalConfig) => void;
	setRecommendations: (response: api.ProfileRecommendationSettings) => void;
	personalisationAssetsAnalyticsEvent: (coldStart: boolean) => void;
	personalisationGenresAnalyticsEvent: (coldStart: boolean) => void;
}

const bem = new Bem('personalisation-settings');
const SUCCESSFUL_UPDATE_PERSONALISATION_ID = 'successful-update-personalisation';

type Props = DispatchProps & OwnProps & StateProps;

class PersonalisationSettings extends React.Component<Props, State> {
	state: State = {
		categories: [],
		boostWidgetId: '',
		zoomWidgetId: '',
		selectedCategories: [],
		step: PersonalisationSteps.CategorySelection,
		recommendations: [],
		selectedItems: [],
		hasError: false,
		scrollable: false,
		totalPage: 0,
		refUsecase: '',
		listData: {}
	};

	componentDidMount() {
		const { listId, selectedCategories, personalisationGenresAnalyticsEvent, coldStart } = this.props;
		if (listId) {
			this.getGenres(listId, selectedCategories);
			personalisationGenresAnalyticsEvent(coldStart);
		}
	}

	componentWillReceiveProps(nextProps: Props) {
		if (this.props.profile !== nextProps.profile && nextProps.listId) {
			this.getGenres(nextProps.listId, nextProps.selectedCategories);
		}
	}

	componentDidUpdate(_: Props, oldState: State) {
		const { step } = this.state;

		if (oldState.step !== step) {
			switch (step) {
				case PersonalisationSteps.CategorySelection:
					this.props.personalisationGenresAnalyticsEvent(this.props.coldStart);
					break;
				case PersonalisationSteps.ContentSelection:
					this.props.personalisationAssetsAnalyticsEvent(this.props.coldStart);
					break;
			}
		}
	}

	resetScrollPosition = () => window.scrollTo({ top: 0 });

	private getGenres = (listId: string, selectedCategories: string[]) => {
		this.props
			.getGenreList(listId)
			.then(({ payload }) => {
				const { items = [], customFields = {} } = payload;
				this.setState({
					categories: items,
					boostWidgetId: get(customFields, BOOST_WIDGET_COLD_START_EOP_WEB),
					zoomWidgetId: get(customFields, ZOOM_WIDGET_COLD_START_EOP_WEB),
					selectedCategories
				});
			})
			.catch(error => {
				this.setState({ hasError: true });
			});
	};

	private getSubgenre = () => {
		const { categories, selectedCategories } = this.state;
		const subgenre = selectedCategories.reduce((subgenreStr, alias) => {
			const category = categories.find(category => get(category, 'customFields.genreAlias') === alias);
			const subgenre = get(category, 'customFields.subgenre') || '';
			subgenreStr += subgenre;
			return subgenreStr;
		}, '');

		return subgenre;
	};

	private onSelectCategories = (categories: string[]) => {
		this.setState({ selectedCategories: categories });
	};

	private onSelectItems = selectedItemIds => {
		const { recommendations } = this.state;
		const selectedItems = recommendations.filter(item => selectedItemIds.includes(item.id));
		this.setState({ selectedItems });
	};

	private getRecommendationList = (page = 1) => {
		const { boostWidgetId, zoomWidgetId, selectedCategories } = this.state;
		const { profile, getBoostRecommendations, getZoomRecommendations } = this.props;

		const options = {
			page,
			pageSize
		};
		let getRecommendations;
		if (boostWidgetId) {
			const subGenre = this.getSubgenre();
			getRecommendations = getBoostRecommendations(boostWidgetId, {
				...options,
				subGenre
			});
		} else {
			// Fallback to zoom recommendations if boostWidgetId is not configured on AXIS
			const genreAliases = selectedCategories as content.GetRecommendationsListOptions['genreAliases'];
			const segments = getProfileSegment(profile);
			getRecommendations = getZoomRecommendations(zoomWidgetId, {
				...options,
				currentUrl: window.location.pathname,
				genreAliases,
				segments
			});
		}

		getRecommendations
			.then(res => {
				const { payload, error } = res;
				if (error || (payload.items && !payload.items.length)) {
					this.setState({ hasError: true });
				} else {
					const firstPage = page === 1;
					this.setState({
						recommendations: firstPage ? [...payload.items] : [...this.state.recommendations, ...payload.items],
						step: PersonalisationSteps.ContentSelection,
						scrollable: firstPage ? payload.size > payload.items.length : this.state.scrollable,
						totalPage: parseInt(payload.paging.total),
						refUsecase: payload.refUsecase || '',
						listData: payload.listData
					});
				}
			})
			.catch(() => {
				this.setState({ hasError: true });
			});
	};

	private onAbortColdStart() {
		const { selectedCategories } = this.state;
		selectedCategories.length
			? this.showPassiveNotification('@{personalization_cancel_with_selection}')
			: this.showPassiveNotification('@{personalization_cancel_no_selection}');
		this.setState(
			{
				selectedCategories: this.props.selectedCategories
			},
			() => browserHistory.push(this.getRedirectPath())
		);
	}

	private onResetItemSelection() {
		this.setState({ selectedItems: [], step: PersonalisationSteps.CategorySelection });
	}

	private onCancel = () => {
		this.state.step === PersonalisationSteps.CategorySelection ? this.onAbortColdStart() : this.onResetItemSelection();
		this.resetScrollPosition();
	};

	private getRedirectPath(): string {
		const { profile, homePath, accountPath, accountEditPath, profileManagement, isPrimary } = this.props;
		if (profileManagement) {
			return isPrimary ? getAccountProfileEditPath(accountEditPath, profile.id) : accountPath;
		}
		return homePath;
	}

	private showPassiveNotification(message: string) {
		this.props.showPassiveNotification({
			content: (
				<IntlFormatter>
					{message}
					<IntlFormatter className={bem.e('toast')}>{'@{personalization_cancel_route}'}</IntlFormatter>
				</IntlFormatter>
			)
		});
	}

	private updateProfile = () => {
		const { selectedItems, selectedCategories } = this.state;
		const { profile, setRecommendations, updateRecommendationSettings, showModal } = this.props;

		const data: api.RecommendationSettingsUpdateRequest = {
			genreAliases: selectedCategories,
			itemIds: selectedItems.map(item => item.id)
		};

		const options: UpdateRecommendationSettingsOptions = { segments: getProfileSegment(profile) };

		updateRecommendationSettings(profile.id, data, options)
			.then(response => {
				if (!response.error) {
					setRecommendations({ ...response.payload, profileId: profile.id });
					browserHistory.push(this.getRedirectPath());

					showModal({
						id: SUCCESSFUL_UPDATE_PERSONALISATION_ID,
						type: ModalTypes.CONFIRMATION_DIALOG,
						componentProps: this.getModalConfigData(),
						disableAutoClose: true
					});
				} else {
					this.setState({ hasError: true });
				}
			})
			.catch(error => {
				this.setState({ hasError: true });
			});
	};

	private getPersonalisationCtaLabel(): PersonalisationModalCta {
		const { profileManagement } = this.props;
		if (profileManagement) {
			return PersonalisationModalCta.profileManagement;
		}
		return PersonalisationModalCta.coldStart;
	}

	private getModalConfigData(): ConfirmationDialogProps {
		const { isPrimary } = this.props;
		return {
			title: '@{successful-update-personalisation_title}',
			children: (
				<div>
					<IntlFormatter className="margin-bottom" elementType="div">
						{isPrimary
							? '@{successful-update-personalisation_body1}'
							: '@{successful-create-secondary-personalisation_body1}'}
					</IntlFormatter>
					<IntlFormatter elementType="div">
						{isPrimary
							? '@{successful-update-personalisation_body2}'
							: '@{successful-create-secondary-personalisation_body2}'}
						<IntlFormatter>{'@{successful-update-my-account-label}'}</IntlFormatter>
					</IntlFormatter>
				</div>
			),
			confirmLabel: this.getPersonalisationCtaLabel(),
			onConfirm: () => noop,
			id: SUCCESSFUL_UPDATE_PERSONALISATION_ID,
			className: SUCCESSFUL_UPDATE_PERSONALISATION_ID
		};
	}

	renderContent() {
		const {
			categories,
			step,
			recommendations,
			selectedItems,
			selectedCategories,
			hasError,
			scrollable,
			totalPage
		} = this.state;

		if (hasError) {
			return this.renderErrorScreen();
		} else if (step === PersonalisationSteps.CategorySelection) {
			return (
				<PersonalisationCategories
					selectedCategories={selectedCategories}
					categories={categories}
					onSelectCategories={this.onSelectCategories}
				/>
			);
		} else if (step === PersonalisationSteps.ContentSelection) {
			return (
				<PersonalisationItemSelection
					categories={categories}
					selectedCategories={selectedCategories}
					items={recommendations}
					onSelectItems={this.onSelectItems}
					selectedItemIds={selectedItems.map(item => item.id)}
					scrollable={scrollable}
					totalPage={totalPage}
					getRecommendationList={this.getRecommendationList}
				/>
			);
		}
	}

	private renderIntro() {
		const { step, hasError } = this.state;
		return (
			<div className={bem.e('intro')}>
				<IntlFormatter values={{ name: this.props.fullName }} elementType="h2" className="ah-title titlecase">
					{`@{account_ah_greeting|Hi {name}},`}
				</IntlFormatter>
				{!hasError && step === PersonalisationSteps.CategorySelection ? (
					<div>
						<IntlFormatter elementType="p" className="form-text">
							{'@{personalization_step_1_description_line_1}'}
						</IntlFormatter>
						<IntlFormatter elementType="p" className="form-text">
							{'@{personalization_step_1_description_line_2}'}
						</IntlFormatter>
					</div>
				) : (
					<IntlFormatter elementType="p" className="form-text">
						{'@{personalization_step_2_description}'}
					</IntlFormatter>
				)}
			</div>
		);
	}

	renderErrorScreen() {
		return (
			<div className={bem.e('error')}>
				<IntlFormatter elementType="div">{'@{personalisation__error-body1}'}</IntlFormatter>
				<IntlFormatter elementType="div" className="margin-top">
					{'@{personalisation__error-body2}'}
				</IntlFormatter>
			</div>
		);
	}

	isButtonsDisabled() {
		const { selectedCategories, step } = this.state;
		const isSelectedItemsEnabled = false;

		return step === PersonalisationSteps.CategorySelection ? !selectedCategories.length : isSelectedItemsEnabled;
	}

	onClickError = () => {
		return browserHistory.push(this.getRedirectPath());
	};

	onClick = () =>
		this.state.step === PersonalisationSteps.CategorySelection ? this.getRecommendationList() : this.updateProfile();

	private renderButtons() {
		const { step, hasError } = this.state;
		const onConfirmLabel =
			step === PersonalisationSteps.CategorySelection
				? '@{personalization_step_1_next_button|Next}'
				: '@{mylist_finish_cta|Finish}';

		const onCancelLabel =
			step === PersonalisationSteps.CategorySelection
				? '@{account_common_cancel_button_label|Cancel}'
				: '@{button_label_back|Back}';

		if (hasError) {
			return (
				<div className={bem.e('buttons')}>
					<CtaButton ordinal="primary" onClick={this.onClickError}>
						<IntlFormatter>{'@{app.ok}'}</IntlFormatter>
					</CtaButton>{' '}
				</div>
			);
		} else {
			return (
				<div className={bem.e('buttons')}>
					{this.wrapButtonCTA(
						<CtaButton ordinal="primary" onClick={this.onClick} disabled={this.isButtonsDisabled()}>
							<IntlFormatter>{onConfirmLabel}</IntlFormatter>
						</CtaButton>
					)}

					<CtaButton ordinal="secondary" onClick={this.onCancel}>
						<IntlFormatter>{onCancelLabel}</IntlFormatter>
					</CtaButton>
				</div>
			);
		}
	}

	private wrapButtonCTA(children) {
		const { step, selectedItems, refUsecase, listData } = this.state;
		const subgenre = this.getSubgenre();
		if (step === PersonalisationSteps.CategorySelection) {
			return children;
		}
		return (
			<CTAWrapper
				type={CTATypes.Preferences}
				data={{ items: selectedItems, subgenre: subgenre, refUsecase: refUsecase, list: listData }}
			>
				{children}
			</CTAWrapper>
		);
	}

	render() {
		return (
			<section className={bem.b()}>
				<div className={bem.e('content-container', { error: this.state.hasError, coldstart: this.props.coldStart })}>
					{this.renderIntro()}
					{this.renderContent()}
				</div>
				{this.renderButtons()}
			</section>
		);
	}
}

const mapStateToProps = ({ account, app }: state.Root, ownProps?: any): StateProps => {
	const { profileId } = ownProps;
	const primaryId = get(account, 'info.primaryProfileId');
	const personalisation = get(app, 'config.personalisation');
	const profileIdToPersonalise = profileId ? profileId : primaryId;
	const profiles = get(account, 'info.profiles') || [];
	const profile = getProfileById(profiles, profileIdToPersonalise);
	const isPrimary = primaryId === profileIdToPersonalise;
	const selectedCategories = get(profile, 'recommendationSettings.genreAliases') || [];

	return {
		listId: selectPersonalisationGenreListId(profile, personalisation),
		fullName: isPrimary ? selectFullName(account) : profile.name,
		profile,
		homePath: getPathByKey(Home, app.config),
		accountPath: getPathByKey(Account, app.config),
		accountEditPath: getPathByKey(AccountProfileEdit, app.config),
		selectedCategories,
		isPrimary
	};
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
	getGenreList: listId => dispatch(getList(listId, {}, { listKey: genreId })),
	getBoostRecommendations: (widgetId, options?) => dispatch(getBoostRecommendations(widgetId, options)),
	getZoomRecommendations: (widgetId, options?) => dispatch(getZoomRecommendations(widgetId, options)),
	showPassiveNotification: (config: PassiveNotificationConfig): Promise<any> =>
		dispatch(ShowPassiveNotification(config)),
	updateRecommendationSettings: (
		id: string,
		body: api.RecommendationSettingsUpdateRequest,
		options?: UpdateRecommendationSettingsOptions,
		info?: any
	) => dispatch(updateRecommendationSettings(id, body, options, info)),
	showModal: (modalConfig: ModalConfig) => dispatch(OpenModal(modalConfig)),
	setRecommendations: response => dispatch(setRecommendationSettings(response)),
	personalisationGenresAnalyticsEvent: coldStart => {
		let path = window.location.pathname;
		if (coldStart) {
			path = '/cold-start';
		}

		return dispatch(
			analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
				path: path + '-step-1',
				type: 'Page'
			})
		);
	},
	personalisationAssetsAnalyticsEvent: coldStart => {
		let path = window.location.pathname;
		if (coldStart) {
			path = '/cold-start';
		}

		return dispatch(
			analyticsEvent(AnalyticsEventType.GENERIC_ANALYTICS_EVENT, {
				path: path + '-step-2',
				type: 'Page'
			})
		);
	}
});

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(PersonalisationSettings);
