import * as React from 'react';
import * as cx from 'classnames';
import Select, { selectBem } from './select/Select';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './LanguageFilter.scss';

interface LanguageFilterProps {
	onLanguageChange?: (language) => void;
	languages?: Array<api.Language>;
	selectedLanguageCode?: string;
}
interface LanguageFilterState {
	selectedLanguageCode: string;
}

export default class LanguageFilter extends React.Component<LanguageFilterProps, LanguageFilterState> {
	constructor(props) {
		super(props);
		const { selectedLanguageCode } = props;
		this.state = {
			selectedLanguageCode
		};
	}
	componentWillReceiveProps(newProps) {
		if (newProps.selectedLanguage !== this.props.selectedLanguageCode)
			this.setState({ selectedLanguageCode: newProps.selectedLanguageCode });
	}

	render() {
		const { selectedLanguageCode } = this.state;
		const { languages } = this.props;

		const items: any[] = languages.map(lang => this.renderItem(lang));
		const labelValues = { selectedLanguageCode };
		const label = languages.find(lang => lang.code === this.state.selectedLanguageCode).label;

		return (
			<div className="language-filter">
				<Select autoExpand={false} labelValues={labelValues} label={label} options={items} />
			</div>
		);
	}

	private onOptionClick = language => {
		this.props.onLanguageChange(language);
		this.setState({ selectedLanguageCode: language });
	};

	private renderItem = lang => {
		const itemClasses: string = cx(
			selectBem.e('item', {
				active: this.state.selectedLanguageCode === lang
			})
		);

		return (
			<li key={lang.code} className={itemClasses} onClick={() => this.onOptionClick(lang.code)}>
				<IntlFormatter elementType="span">{lang.label}</IntlFormatter>
			</li>
		);
	};
}
