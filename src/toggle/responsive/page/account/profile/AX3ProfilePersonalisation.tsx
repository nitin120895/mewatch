import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { selectPersonalisationGenreListId } from 'shared/selectors/personalisation';
import { getList } from 'shared/service/action/content';
import { get } from 'shared/util/objects';
import { Genre as genreId } from 'shared/list/listId';
import { AccountProfilePersonalisation } from 'shared/page/pageKey';
import { browserHistory } from 'shared/util/browserHistory';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { getProfileById } from 'shared/selectors/personalisation';
import PersonalisationCategories from 'toggle/responsive/page/account/profile/PersonalisationCategories';
import { PersonalizationCategoriesMode } from 'toggle/responsive/util/PersonalisationUtil';

const bem = new Bem('profile-personalisation');

interface State {
	categories: api.ItemList[];
	hasError: boolean;
}

interface DispatchProps {
	getGenreList: (listId: string) => Promise<any>;
}

interface StateProps {
	listId: string;
	selectedCategories: string[];
	profileRecommendations: string;
}

interface OwnProps {
	profileId?: string;
	newProfile?: boolean;
	editingActiveProfile?: boolean;
	isPrimaryProfileActive?: boolean;
	categories: string[];
}

type Props = OwnProps & StateProps & DispatchProps;

class AX3ProfilePersonalisation extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			categories: [],
			hasError: false
		};
	}

	componentDidMount() {
		const { listId } = this.props;
		if (listId) {
			this.getGenres(listId);
		}
	}

	private getGenres = (listId: string) => {
		this.props
			.getGenreList(listId)
			.then(({ payload }) => {
				const { items = [] } = payload;
				this.setState({ categories: items });
			})
			.catch(error => {
				this.setState({ hasError: true });
			});
	};

	private onPersonalisationAction = () => {
		const { profileId, profileRecommendations } = this.props;
		browserHistory.replace(`${profileRecommendations}?profileId=${profileId}`);
	};

	isDisabled() {
		const { editingActiveProfile, newProfile } = this.props;
		return !editingActiveProfile && !newProfile;
	}

	private getButtonTitle(): string {
		const { selectedCategories } = this.props;
		if (!selectedCategories.length) return '@{form_add_personalisation_label}';
		return '@{form_edit_personalisation_label}';
	}

	private renderCategories() {
		const { categories } = this.state;
		const { selectedCategories } = this.props;

		if (!selectedCategories.length) {
			return <IntlFormatter>{'@{form_selected_categories_label}'}</IntlFormatter>;
		}

		return (
			<div className={bem.e('categories')}>
				<PersonalisationCategories
					selectedCategories={selectedCategories}
					categories={categories}
					mode={PersonalizationCategoriesMode.preview}
				/>
			</div>
		);
	}

	render() {
		return (
			<div className={cx(bem.b(), { disabled: this.isDisabled() })}>
				<AccountEntryWrapper title="@{account_personalisation_title|Personalised preferences}">
					<IntlFormatter className={bem.e('description')}>{'@{account_personalisation_description}'}</IntlFormatter>
					<div className={bem.e('container')}>
						<IntlFormatter className={bem.e('preferred')}>{'@{account_personalisation_preferred}'}</IntlFormatter>
						{this.renderCategories()}
						<IntlFormatter
							elementType={CtaButton}
							className="edit-button"
							componentProps={{
								onClick: this.onPersonalisationAction
							}}
						>
							{this.getButtonTitle()}
						</IntlFormatter>
					</div>
				</AccountEntryWrapper>
			</div>
		);
	}
}

const mapStateToProps = ({ account, app }: state.Root, ownProps?: any): StateProps => {
	const { profileId } = ownProps;
	const personalisation = get(app, 'config.personalisation');
	const profileIdToPersonalise = profileId ? profileId : get(account, 'info.primaryProfileId');
	const profiles = get(account, 'info.profiles') || [];
	const profile = getProfileById(profiles, profileIdToPersonalise);
	const selectedCategories = get(profile, 'recommendationSettings.genreAliases') || [];

	return {
		listId: selectPersonalisationGenreListId(profile, personalisation),
		selectedCategories,
		profileRecommendations: getPathByKey(AccountProfilePersonalisation, app.config)
	};
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
	getGenreList: listId => dispatch(getList(listId, {}, { listKey: genreId }))
});

export default connect<{}, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(AX3ProfilePersonalisation);
