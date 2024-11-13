import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import SearchIcon from 'ref/responsive/component/SearchIcon';
import ClearIcon from 'ref/responsive/page/search/ClearIcon';
import Spinner from 'ref/responsive/component/Spinner';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { setItem } from 'shared/util/localStorage';
import TriggerProvider from 'shared/analytics/components/TriggerProvider';
import { DomTriggerPoints } from 'shared/analytics/types/types';

import './SearchInput.scss';

interface SearchInputProps extends React.Props<any> {
	onValueChange?: (value: string) => void;
	onInputSubmit?: (value: string) => void;
	className?: string;
	autoFocus?: boolean;
	value: string;
	loading?: boolean;
}

interface SearchInputState {
	populated?: boolean;
}

const bem = new Bem('search-input');
export const SEARCH_QUERY = 'search_query';
/**
 * Search input component.
 */
export default class SearchInput extends React.PureComponent<SearchInputProps, SearchInputState> {
	static defaultProps = {
		autoFocus: false
	};

	private inputRef: HTMLInputElement;

	constructor(props) {
		super(props);
	}

	private focus() {
		if (this.inputRef) {
			this.inputRef.focus();
		}
	}

	private onInputRef = ref => {
		this.inputRef = findDOMNode<HTMLInputElement>(ref);
	};

	private onChange = e => {
		const onValueChange = this.props.onValueChange;
		if (onValueChange) onValueChange(e.target.value);
	};

	private onSubmit = e => {
		e.preventDefault();
		const onInputSubmit = this.props.onInputSubmit;
		if (onInputSubmit && this.inputRef) {
			onInputSubmit(this.inputRef.value);
		}
	};

	private onReset = e => {
		e.preventDefault();
		const onValueChange = this.props.onValueChange;
		if (onValueChange) onValueChange('');
		this.focus();
	};

	private onBlur = e => {
		e.preventDefault();
		setItem(SEARCH_QUERY, this.props.value);
	};

	render() {
		const { className, autoFocus, value, loading } = this.props;
		return (
			<div className={cx(bem.b({ 'has-value': !!value }), className)}>
				<div className={cx(bem.e('background'), 'full-bleed')} />
				<TriggerProvider trigger={DomTriggerPoints.SearchPage}>
					<form className={bem.e('form')} onSubmit={this.onSubmit} onReset={this.onReset} role="search">
						<IntlFormatter
							elementType="input"
							ref={this.onInputRef}
							className={cx(bem.e('input'), 'full-bleed')}
							autoFocus={autoFocus}
							autoComplete="off"
							value={value}
							onBlur={this.onBlur}
							onChange={this.onChange}
							formattedProps={{
								placeholder: '@{search_input_placeholder|Search Series, Movies, Cast & Crew}',
								'aria-label': '@{search_input_aria|Search}'
							}}
						/>
						<div className={bem.e('icons')}>
							{loading ? (
								<Spinner className={bem.e('icon', 'spinner')} />
							) : (
								<SearchIcon className={bem.e('icon', 'search')} />
							)}
							{this.renderClearButton()}
						</div>
					</form>
				</TriggerProvider>
			</div>
		);
	}

	private renderClearButton() {
		const { value } = this.props;
		if (value && !value.length) return undefined;
		return (
			<IntlFormatter
				elementType="button"
				className={bem.e('icon', 'clear')}
				type="reset"
				role="presentation"
				formattedProps={{ 'aria-label': '@{search_reset_label|Clear Search Term}' }}
			>
				<ClearIcon />
			</IntlFormatter>
		);
	}
}
