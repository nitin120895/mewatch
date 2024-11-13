import * as React from 'react';
import { connect } from 'react-redux';
import SecondaryNav from '../nav/SecondaryNav';
import Link from 'shared/component/Link';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import * as AppActions from 'shared/app/appWorkflow';
import { memoize } from 'shared/util/performance';
import LanguageSelect from 'ref/responsive/component/LanguageSelect';
import NavEntryLink from 'ref/responsive/app/nav/NavEntryLink';
import { LANGUAGE_SELECTOR_ID } from '../../component/LanguageSelect';

import './Footer.scss';

interface FooterProps {
	footer?: api.NavEntry;
	copyright?: string;
	onBackToTop?: (e: any) => void;
	focusable?: boolean;
	currentLanguage?: api.Language;
	languages?: Array<api.Language>;
	updateLocale?: (locale: string) => Promise<any>;
	theme?: AppTheme;
	loadLanguages?: () => void;
	closeModal?: () => void;
}

const bem = new Bem('footer');

class Footer extends React.PureComponent<FooterProps, any> {
	private onUpdateLanguage = (lang: api.Language) => {
		if (lang) {
			this.props.updateLocale(lang.code);
		}
	};

	render() {
		const { footer, copyright, onBackToTop, focusable, currentLanguage, languages, theme } = this.props;

		const footerChildren = footer ? footer.children || [] : [];
		const layout = footerChildren.length !== 1 ? 'vertical' : 'horizontal';
		const themeContrast = theme === 'account' ? 'light' : 'dark';

		return (
			<IntlFormatter
				elementType="footer"
				className={bem.b({ empty: !footer && !copyright })}
				aria-hidden={!focusable}
				role="navigation"
				formattedProps={{ 'aria-label': '@{nav_footer_aria|Footer}' }}
			>
				{footer && footer.label && <NavEntryLink className={bem.e('title')} entry={footer} />}
				<div className={bem.e('content')}>
					{footer && (
						<SecondaryNav
							className={bem.e('nav', { horizontal: footerChildren.length === 1 })}
							entries={[footer]}
							displayCategoryTitle={false}
							autoFocus={false}
							includeContent={false}
						/>
					)}
					<div className={bem.e('language', layout)}>
						<IntlFormatter
							elementType="label"
							className={bem.e('language-title')}
							formattedProps={{
								htmlFor: LANGUAGE_SELECTOR_ID
							}}
						>
							{'@{nav_footer_language_title|Select Language}'}
						</IntlFormatter>
						<LanguageSelect
							selectedLanguage={currentLanguage}
							languages={languages}
							onChange={this.onUpdateLanguage}
							theme={themeContrast}
						/>
					</div>
				</div>

				<div className={bem.e('bottom')}>
					<label className={bem.e('copy', { empty: !copyright })}>{copyright || ''}</label>
					<IntlFormatter
						elementType={Link}
						className={bem.e('back')}
						onClick={onBackToTop}
						componentProps={{ to: '#' }}
					>
						{'@{nav_footer_backToTop_label|Scroll to top}'}
					</IntlFormatter>
				</div>
			</IntlFormatter>
		);
	}
}

const findCurrentLanguage = memoize((i18n: state.I18n) => {
	return i18n.languages.find(language => language.code === i18n.lang);
});

function mapStateToProps({ app }: state.Root): FooterProps {
	const { footer, copyright } = app.config.navigation;
	return {
		footer,
		copyright,
		languages: app.i18n.languages,
		theme: app.theme,
		currentLanguage: findCurrentLanguage(app.i18n)
	};
}

const actions = {
	updateLocale: AppActions.updateLocale
};

export default connect<any, any, FooterProps>(
	mapStateToProps,
	actions
)(Footer);
