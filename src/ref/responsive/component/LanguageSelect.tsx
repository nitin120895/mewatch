import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import GlobeIcon from 'ref/responsive/component/icons/GlobeIcon';
import ChevronIcon from 'ref/responsive/component/icons/ChevronIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './LanguageSelect.scss';

interface LanguageSelectProps {
	onChange?: (language) => void;
	languages?: Array<api.Language>;
	selectedLanguage?: api.Language;
	className?: string;
	theme?: 'light' | 'dark';
}

export const LANGUAGE_SELECTOR_ID = 'languageSelector';

const bem = new Bem('language-select');

export default class LanguageSelect extends React.Component<LanguageSelectProps, any> {
	static defaultProps = {
		languages: [],
		onChange: noop,
		theme: 'dark',
		selectedLanguage: {}
	};

	private node: HTMLInputElement;

	private onLanguageChange = e => {
		const { languages, onChange } = this.props;
		const language = languages.find(lang => lang.code === e.target.value);
		this.node.blur();
		onChange(language);
	};

	private onRef = node => {
		this.node = node;
	};

	render() {
		const { selectedLanguage, languages, className, theme } = this.props;
		return (
			<div className={cx(className, bem.b(theme))}>
				<GlobeIcon className={bem.e('globe')} />
				<select
					id={LANGUAGE_SELECTOR_ID}
					value={selectedLanguage.code}
					className={bem.e('languages')}
					onChange={this.onLanguageChange}
					ref={this.onRef}
				>
					{this.renderUnknownLanguage(selectedLanguage)}
					{languages.map(lang => (
						<option key={lang.code} className={bem.e('languages-item')} value={lang.code}>
							{lang.label || lang.title}
						</option>
					))}
				</select>
				<ChevronIcon className={bem.e('indicator')} />
			</div>
		);
	}

	private renderUnknownLanguage(selectedLanguage) {
		if (selectedLanguage.code) return false;
		// If the published languages don't match our compiled default we display a placeholder to ensure
		// we don't misrepresent the language relative to the rendered content.
		// In this situation this gets auto-selected as the first option in the select.
		return <IntlFormatter elementType="option">{`@{nav_footer_language_fallback_option|Choose}`}</IntlFormatter>;
	}
}
