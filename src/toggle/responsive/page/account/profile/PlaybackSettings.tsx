import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import AccountEntryWrapper from 'ref/responsive/pageEntry/account/common/AccountEntryWrapper';
import RadioButtonComponent from '../../../component/input/RadioButtonComponent';
import AccountButton from 'ref/responsive/component/input/AccountButton';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { OPTION_OFF } from 'shared/app/localeUtil';

interface State {
	editMode: boolean;
	subtitleLanguage: string;
	audioLanguage: string;
}

interface OwnProps {
	newProfile?: boolean;
	editingActiveProfile?: boolean;
	isPrimaryProfileActive?: boolean;
	subtitleLanguage?: string;
	audioLanguage?: string;
	onSubmit?: () => void;
	activateEntry?: () => void;
	onSelectAudio: (audio: string) => void;
	onSelectSubtitle: (subtitle: string) => void;
	updateProfile?: (data: object) => void;
}

interface StateProps {
	audioLanguages?: Array<api.Language>;
	subtitleLanguages?: Array<api.Language>;
}

type Props = OwnProps & StateProps;

const bem = new Bem('profile-playback-settings');

class AX2ProfilelaybackSettings extends React.PureComponent<Props, State> {
	constructor(props) {
		super(props);
		const { isPrimaryProfileActive, editingActiveProfile, subtitleLanguage, audioLanguage, newProfile } = props;

		this.state = {
			editMode: isPrimaryProfileActive || (editingActiveProfile && isPrimaryProfileActive) || newProfile,
			subtitleLanguage,
			audioLanguage
		};
	}

	componentDidMount() {
		const { audioLanguages, subtitleLanguages } = this.props;
		const { subtitleLanguage, audioLanguage } = this.state;
		if (!subtitleLanguage && subtitleLanguages) {
			this.setDefaultSubtitleLanguage();
		}
		if (!audioLanguage && audioLanguages) {
			this.setDefaultAudioLanguage();
		}
	}

	componentWillReceiveProps(nextProps) {
		const { subtitleLanguage, audioLanguage, isPrimaryProfileActive } = this.props;
		if (
			(nextProps.subtitleLanguage !== subtitleLanguage || nextProps.audioLanguage !== audioLanguage) &&
			!isPrimaryProfileActive
		) {
			this.toggleEditMode();
		}
	}

	private setDefaultAudioLanguage = () => {
		const { audioLanguages, onSelectAudio } = this.props;
		const defaultAudioLanguage = audioLanguages.find(language => language.code === 'en');
		const audioLanguage = defaultAudioLanguage || audioLanguages[0];
		this.setState({ audioLanguage: audioLanguage.code });
		onSelectAudio(audioLanguage.code);
	};

	private setDefaultSubtitleLanguage = () => {
		const { subtitleLanguages, onSelectSubtitle } = this.props;
		const defaultSubtitleLanguage = subtitleLanguages.find(language => language.code === 'en');
		const subtitleLanguage = defaultSubtitleLanguage || subtitleLanguages[0];
		this.setState({ subtitleLanguage: subtitleLanguage.code });
		onSelectSubtitle(subtitleLanguage.code);
	};

	private hideButtons = () => {
		const { isPrimaryProfileActive, newProfile } = this.props;
		return isPrimaryProfileActive || newProfile;
	};

	private onChangeAudioLanguage(audioLanguage) {
		if (this.hideButtons()) {
			this.props.onSelectAudio(audioLanguage);
		}
		this.setState({ audioLanguage });
	}

	private onChangeSubtitleLanguage(subtitleLanguage) {
		if (this.hideButtons()) {
			this.props.onSelectSubtitle(subtitleLanguage);
		}
		this.setState({ subtitleLanguage });
	}

	private toggleEditMode = () => {
		this.setState({
			editMode: !this.state.editMode
		});
	};

	private onSubmit = e => {
		e.preventDefault();
		const { subtitleLanguage, audioLanguage } = this.state;
		const { updateProfile } = this.props;
		if (subtitleLanguage === this.props.subtitleLanguage && audioLanguage === this.props.audioLanguage) {
			this.toggleEditMode();
		} else {
			updateProfile({
				subtitleLanguage,
				audioLanguage
			});
		}
	};

	private onCancel = () => {
		const { subtitleLanguage, audioLanguage } = this.props;
		if (!audioLanguage) this.setDefaultAudioLanguage();
		else this.setState({ audioLanguage });

		if (!subtitleLanguage) this.setDefaultSubtitleLanguage();
		else this.setState({ subtitleLanguage });

		this.toggleEditMode();
	};

	private renderRadioButtons() {
		const { audioLanguages, subtitleLanguages, newProfile, editingActiveProfile } = this.props;
		const { subtitleLanguage, audioLanguage, editMode } = this.state;

		if (!audioLanguages || !subtitleLanguages) return;

		return (
			<form className={cx(bem.e('content'), { 'flex-container': !editMode && !newProfile })} onSubmit={this.onSubmit}>
				<div className="content-container">
					{editMode && (
						<IntlFormatter className={bem.e('description')} elementType="div">
							{`@{account_preferred_language_description|Select your preferred audio and subtitle language. Your preference may not be available in certain programmes.}`}
						</IntlFormatter>
					)}

					<IntlFormatter elementType="div" className={bem.e('preferred')}>
						{`@{account_preferred_language_label|Select Preferred Audio Language}`}
					</IntlFormatter>
					{editMode ? (
						<div className={bem.e('choices')}>
							{audioLanguages.map(language => (
								<RadioButtonComponent
									name="preferredAudioLanguages"
									value={language.code}
									key={language.code}
									onChange={() => this.onChangeAudioLanguage(language.code)}
									label={`@{account_preferred_language_label_${language.label}|${language.label}}`}
									checked={language.code === audioLanguage}
									disabled={this.isDisabled()}
								/>
							))}
						</div>
					) : (
						<div className={bem.e('choices')}>
							{audioLanguages
								.filter(language => language.code === audioLanguage)
								.map(language => (
									<IntlFormatter className="label-primary" key={language.code}>
										{`@{account_preferred_language_label_${language.label}|${language.label}}`}
									</IntlFormatter>
								))}
						</div>
					)}

					<IntlFormatter className={bem.e('subtitle')} elementType="div">
						{`@{account_preferred_subtitle_language_label|Select Preferred Subtitle Language}`}
					</IntlFormatter>
					{editMode ? (
						<div className={bem.e('choices')}>
							{subtitleLanguages.map(language => (
								<RadioButtonComponent
									name="preferredSubtitleLanguages"
									value={language.code}
									key={language.code}
									onChange={() => this.onChangeSubtitleLanguage(language.code)}
									label={language.label}
									checked={language.code === subtitleLanguage}
									disabled={this.isDisabled()}
								/>
							))}
						</div>
					) : (
						<div className={bem.e('choices')}>
							{subtitleLanguages
								.filter(language => language.code === subtitleLanguage)
								.map(language => (
									<IntlFormatter className="label-primary" key={language.code}>
										{language.label}
									</IntlFormatter>
								))}
						</div>
					)}
				</div>
				{this.hideButtons() ? (
					false
				) : editMode ? (
					<div className="button-container">
						<AccountButton type={'submit'} className={bem.e('submit-preferences')}>
							<IntlFormatter>{'@{form_save_changes_button_label|Save changes}'}</IntlFormatter>
						</AccountButton>
						<CtaButton ordinal="secondary" onClick={this.onCancel} className="cancel">
							<IntlFormatter>{'@{account_common_cancel_button_label|Cancel}'}</IntlFormatter>
						</CtaButton>
					</div>
				) : (
					<IntlFormatter
						onClick={this.toggleEditMode}
						elementType="button"
						disabled={!editingActiveProfile}
						className="settings-button"
					>
						{'@{form_change_settings_label|Change Settings}'}
					</IntlFormatter>
				)}
			</form>
		);
	}

	render() {
		return (
			<div className={cx(bem.b(), { disabled: this.isDisabled() })}>
				<AccountEntryWrapper title={'Video Playback Settings'}>{this.renderRadioButtons()}</AccountEntryWrapper>
			</div>
		);
	}

	isDisabled() {
		const { editingActiveProfile, newProfile } = this.props;
		return !editingActiveProfile && !newProfile;
	}
}

function arrangeSubtitleArray(languages: api.Language[]) {
	const offOptionExist = languages.find(lang => lang.code === OPTION_OFF.code);
	if (!offOptionExist) {
		languages.unshift(OPTION_OFF);
	} else {
		// Ensure that off is always at the top of the array
		const offIndex = languages.findIndex(item => item.code === OPTION_OFF.code);
		if (offIndex !== 0) {
			const filteredArray = languages.filter(item => item.code !== OPTION_OFF.code);
			languages = [OPTION_OFF, ...filteredArray];
		}
	}
	return languages;
}

function mapStateToProps({ app }: state.Root): StateProps {
	const { audioLanguages } = app.config.general;
	let { subtitleLanguages } = app.config.general;
	subtitleLanguages = arrangeSubtitleArray(subtitleLanguages);
	return {
		audioLanguages,
		subtitleLanguages
	};
}

export default connect<any, any, Props>(
	mapStateToProps,
	undefined
)(AX2ProfilelaybackSettings);
