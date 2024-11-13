import * as React from 'react';
import CtaButton from 'ref/responsive/component/CtaButton';
import { Bem } from 'shared/util/styles';
import { noop } from 'shared/util/function';
import {
	PersonalizationCategoriesMode,
	genreStringToArray,
	getUpdatedGenres,
	isCategorySelected
} from 'toggle/responsive/util/PersonalisationUtil';
import Tick from 'toggle/responsive/component/icons/Tick';

import './PersonalisationCategories.scss';

const bem = new Bem('personalisation-step1');

interface OwnProps {
	categories: api.ItemList[];
	onSelectCategories?: (categories: string[]) => void;
	selectedCategories: string[];
	mode?: PersonalizationCategoriesMode;
}

export default class PersonalisationCategories extends React.PureComponent<OwnProps> {
	shouldComponentUpdate = () => true;

	static defaultProps = {
		mode: PersonalizationCategoriesMode.edit,
		categories: [],
		selectedCategories: [],
		onSelectCategories: noop
	};

	private onClick = (genreAlias: string) => {
		const selectedCategories = [...this.props.selectedCategories];
		const newCategories = getUpdatedGenres(selectedCategories, genreStringToArray(genreAlias));

		this.props.onSelectCategories(newCategories);
	};

	private renderCategories() {
		const { categories, selectedCategories } = this.props;
		return (
			<div className={bem.e('categories')}>
				{categories.map(category => {
					const {
						customFields: { bgColor = '', genreAlias = '', genreId = '' } = {},
						title,
						images: { custom: icon = '' } = {},
						id
					} = category;
					const selected = isCategorySelected(genreAlias, selectedCategories);

					return (
						<CtaButton
							style={{ backgroundColor: bgColor }}
							className={bem.e('category')}
							ordinal={selected ? 'primary' : 'naked'}
							key={id}
							onClick={() => this.onClick(genreAlias)}
							disabled={false}
						>
							<div className={bem.e('category-inner')}>
								{selected && <Tick className={'icon-wrapper'} />}
								<img src={icon} alt={genreId} />
								<span className={bem.e('category-title')}>{title}</span>
							</div>
						</CtaButton>
					);
				})}
			</div>
		);
	}

	private renderPreviewCategories() {
		const { categories, selectedCategories } = this.props;
		return (
			<div className={bem.e('categories')}>
				{categories.map(category => {
					const {
						customFields: { bgColor = '', genreId = '', genreAlias = '' } = {},
						title,
						images: { custom: icon = '' } = {},
						id
					} = category;
					const selected = isCategorySelected(genreAlias, selectedCategories);
					if (!selected) return;

					return (
						<CtaButton style={{ backgroundColor: bgColor }} className={bem.e('category')} ordinal="naked" key={id}>
							<div className={bem.e('category-inner')}>
								<img src={icon} alt={genreId} />
								<span className={bem.e('category-title')}>{title}</span>
							</div>
						</CtaButton>
					);
				})}
			</div>
		);
	}

	render() {
		const { mode } = this.props;
		return (
			<div className={bem.b()}>
				{mode === PersonalizationCategoriesMode.edit ? this.renderCategories() : this.renderPreviewCategories()}
			</div>
		);
	}
}
