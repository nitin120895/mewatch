import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import RadioButtonComponent from '../../../component/input/RadioButtonComponent';
import { AX1ProfileLanguageSelection as template } from 'shared/page/pageEntryTemplate';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';

const bem = new Bem('profile-language-selection');

interface State {
	editMode: boolean;
	languageCode: string;
}

interface OwnProps {
	editingActiveProfile?: boolean;
	languageCode?: string;
	newProfile?: boolean;
	onSelectDisplay: (language: api.Language) => void;
	isPrimaryProfileActive?: boolean;
	updateProfile?: (data: object) => void;
}

interface StateProps {
	languages: Array<api.Language>;
}

type Props = OwnProps & StateProps;

class AX1ProfileLanguageSelection extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const { isPrimaryProfileActive, editingActiveProfile, languageCode, newProfile } = props;

		this.state = {
			editMode: isPrimaryProfileActive || (editingActiveProfile && isPrimaryProfileActive) || newProfile,
			languageCode
		};
	}

	componentDidMount() {
		if (!this.state.languageCode && this.props.languages) {
			this.setDefaultLanguage();
		}
	}

	componentWillReceiveProps(nextProps) {
		const { languageCode } = this.props;
		if (nextProps.languageCode !== languageCode) {
			this.setState({ languageCode: nextProps.languageCode });
		}
	}

	private setDefaultLanguage = () => {
		const { languages, onSelectDisplay } = this.props;
		const defaultLanguage = languages.find(language => language.code === 'en');
		const language = defaultLanguage || languages[0];
		this.setState({ languageCode: language.code });
		onSelectDisplay(language);
	};

	private hideButtons = () => {
		const { isPrimaryProfileActive, newProfile } = this.props;
		return isPrimaryProfileActive || newProfile;
	};

	private onChangeDisplayLanguage = language => {
		if (this.hideButtons()) {
			this.props.onSelectDisplay(language);
		}
		this.setState({ languageCode: language.code });
	};

	private toggleEditMode = () => {
		this.setState({
			editMode: !this.state.editMode
		});
	};

	private onCancel = () => {
		const { languageCode } = this.props;
		if (!languageCode) this.setDefaultLanguage();
		else this.setState({ languageCode });
		this.toggleEditMode();
	};

	private onSubmit = e => {
		e.preventDefault();
		const { updateProfile } = this.props;
		const { languageCode } = this.state;
		if (languageCode === this.props.languageCode) {
			this.toggleEditMode();
		} else {
			updateProfile({ languageCode });
		}
	};

	render() {
		return (
			<div className={cx(bem.b(), { disabled: !this.isDisabled() })}>
				{this.state.editMode ? this.renderEditMode() : this.renderPreviewMode()}
			</div>
		);
	}

	isDisabled() {
		const { editingActiveProfile, newProfile } = this.props;
		return editingActiveProfile || newProfile;
	}

	private renderEditMode() {
		const { languages } = this.props;
		const { languageCode } = this.state;

		return (
			<AccountEntryWrapper title="@{language_title|Interface display language}">
				<form onSubmit={this.onSubmit} className={bem.e('choices')}>
					{languages.map(language => (
						<RadioButtonComponent
							name="languages"
							value={language.title}
							key={language.code}
							disabled={!this.isDisabled()}
							onChange={() => this.onChangeDisplayLanguage(language)}
							label={language.title}
							checked={language.code === languageCode}
						/>
					))}
					{!this.hideButtons() && (
						<div className="button-container">
							<AccountButton type={'submit'} className={bem.e('submit-preferences')}>
								<IntlFormatter>{'@{form_save_changes_button_label|Save changes}'}</IntlFormatter>
							</AccountButton>
							<CtaButton ordinal="secondary" onClick={this.onCancel} className="cancel">
								<IntlFormatter>{'@{account_common_cancel_button_label|Cancel}'}</IntlFormatter>
							</CtaButton>
						</div>
					)}
				</form>
			</AccountEntryWrapper>
		);
	}

	private renderPreviewMode() {
		const { languages } = this.props;
		const { languageCode } = this.state;
		return (
			<AccountEntryWrapper title="@{language_title|Interface display language}">
				<div className={bem.e('container')}>
					<div className={bem.e('choices')}>
						{languages
							.filter(language => language.code === languageCode)
							.map(language => (
								<IntlFormatter className="label-primary" key={language.code}>
									{language.title}
								</IntlFormatter>
							))}
					</div>
					<IntlFormatter onClick={this.toggleEditMode} className="change-button">
						{'@{form_change_language_label|Change Language}'}
					</IntlFormatter>
				</div>
			</AccountEntryWrapper>
		);
	}
}

function mapStateToProps({ app }: state.Root): StateProps {
	return {
		languages: app.i18n.languages
	};
}

const Component: any = connect<StateProps, any, OwnProps>(
	mapStateToProps,
	undefined
)(AX1ProfileLanguageSelection);
Component.template = template;
export default Component;
