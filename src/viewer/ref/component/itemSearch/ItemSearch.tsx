import * as React from 'react';
import { findDOMNode } from 'react-dom';
import DropdownList from './DropdownList';
import { search, SearchOptions, getItem } from 'shared/service/content';
import { Bem } from 'shared/util/styles';
import { KEY_CODE } from 'shared/util/keycodes';
import * as cx from 'classnames';

import './ItemSearch.scss';

const bem = new Bem('item-search');

const DEFAULT_SEARCH_TERM = 't';

type SearchItemTypes = ('tv' | 'movies' | 'people')[];

interface ItemSearchProps {
	resetParent: (item: api.ItemSummary) => void;
	includeDetail?: boolean;
	itemTypes?: SearchItemTypes;
}

interface ItemSearchState {
	item: api.ItemSummary;
	query: string;
	results: api.ItemSummary[];
	previousItems: api.ItemSummary[];
	resultsDisplay: boolean;
	resultsBoxIndex: number;
	previousItemsDisplay: boolean;
	previousItemsIndex: number;
}

export default class ItemSearch extends React.Component<ItemSearchProps, ItemSearchState> {
	ctrls: {
		[propName: string]: any;
	} = {};
	handleInputWindowListener: any;
	handlePreviousItemsWindowListener: any;

	constructor(props) {
		super(props);
		this.state = {
			item: undefined,
			query: '',
			results: [],
			previousItems: [],
			resultsBoxIndex: undefined,
			previousItemsIndex: undefined,
			resultsDisplay: true,
			previousItemsDisplay: false
		};
		const options = this.getSearchOptions(1, props.itemTypes);
		search(DEFAULT_SEARCH_TERM, options).then(results => this.resetState(results.data.items.items[0]));
		this.handleInputWindowListener = () => {
			if (findDOMNode<HTMLElement>(this.ctrls['input']) === document.activeElement) return;
			this.setState({
				resultsDisplay: false,
				resultsBoxIndex: undefined,
				previousItemsIndex: undefined
			});
			window.removeEventListener('mouseup', this.handleInputWindowListener);
		};
		this.handlePreviousItemsWindowListener = () => {
			this.setState({
				previousItemsDisplay: false,
				resultsBoxIndex: undefined,
				previousItemsIndex: undefined
			});
			window.removeEventListener('mouseup', this.handlePreviousItemsWindowListener);
		};
	}

	componentWillUnmount() {
		window.removeEventListener('mouseup', this.handleInputWindowListener);
		window.removeEventListener('mouseup', this.handlePreviousItemsWindowListener);
	}

	componentDidUpdate() {
		const { resultsDisplay, resultsBoxIndex, previousItemsDisplay, previousItemsIndex } = this.state;
		if (resultsDisplay && !isNaN(resultsBoxIndex)) {
			findDOMNode<HTMLElement>(this.ctrls['resultsBox'].ctrls[`listItem${resultsBoxIndex}`]).focus();
		}
		if (previousItemsDisplay && !isNaN(previousItemsIndex)) {
			findDOMNode<HTMLElement>(this.ctrls['previousItems'].ctrls[`listItem${previousItemsIndex}`]).focus();
		}
	}

	addWindowListener(component: 'input' | 'previousItems') {
		if (component === 'input') window.addEventListener('mouseup', this.handleInputWindowListener, false);
		if (component === 'previousItems')
			window.addEventListener('mouseup', this.handlePreviousItemsWindowListener, false);
	}

	private getSearchOptions(maxResults: number, itemTypes?: SearchItemTypes): SearchOptions {
		const options: SearchOptions = { maxResults };
		if (itemTypes) options.include = itemTypes;
		return options;
	}

	resetState(item?: api.ItemDetail) {
		if (item) {
			if (this.props.includeDetail && !item.credits) {
				getItem(item.id)
					.then(result => {
						this.resetState(result.data);
					})
					.catch(error => console.warn(error));
				return;
			}
			this.props.resetParent(item);
			if (!this.state.previousItems.find(newItem => newItem.id === item.id)) this.state.previousItems.push(item);
			this.setState({
				item,
				query: '',
				results: [],
				resultsBoxIndex: undefined,
				previousItemsIndex: undefined,
				previousItemsDisplay: false
			});
		} else {
			this.setState({
				query: '',
				results: [],
				resultsBoxIndex: undefined,
				previousItemsIndex: undefined,
				previousItemsDisplay: false
			});
		}
	}

	handleInputClick = e => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		this.setState({
			resultsDisplay: true,
			resultsBoxIndex: undefined
		});
		this.addWindowListener('input');
	};

	handleInputChange = e => {
		const query = e.target.value;
		this.setState({ query });
		if (e.target.value) {
			const options = this.getSearchOptions(10, this.props.itemTypes);
			if (this.props.itemTypes) options.include = this.props.itemTypes;
			search(query, options)
				.then(results => this.setState({ results: results.data.items.items }))
				.catch(error => console.warn(error));
		} else this.setState({ results: [] });
	};

	handlePreviousItemsClick = e => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		// Stop doubling up due to similar events onClick and onMouseUp. Stop function if no current previousItems.
		if (e.type === 'mouseup' || this.state.previousItems.length === 0) return;

		// Add window eventListener if previousItems list is being opened.
		if (!this.state.previousItemsDisplay) this.addWindowListener('previousItems');
		this.setState({ previousItemsDisplay: !this.state.previousItemsDisplay, previousItemsIndex: undefined });
	};

	handleKeyDown = (e, component: 'resultsBox' | 'previousItems') => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		const list = component === 'resultsBox' ? this.state.results : this.state.previousItems;
		const indexProp = component === 'resultsBox' ? 'resultsBoxIndex' : 'previousItemsIndex';
		const curIndex = this.state[indexProp];

		switch (e.keyCode) {
			case KEY_CODE.ENTER:
				e.preventDefault();
				if (!isNaN(curIndex)) this.resetState(list[curIndex]);
				else if (component === 'resultsBox' && list.length === 1) this.resetState(list[0]);
				else if (component === 'previousItems')
					this.setState({
						previousItemsDisplay: !this.state.previousItemsDisplay
					});
				break;
			case KEY_CODE.UP:
				e.preventDefault();
				if (isNaN(curIndex) || curIndex === 0) {
					this.setState({ [indexProp]: list.length - 1 } as any);
				} else {
					this.setState({ [indexProp]: curIndex - 1 } as any);
				}
				break;
			case KEY_CODE.DOWN:
				e.preventDefault();
				if (isNaN(curIndex) || curIndex === list.length - 1) {
					this.setState({ [indexProp]: 0 } as any);
				} else {
					this.setState({ [indexProp]: curIndex + 1 } as any);
				}
				break;
			case KEY_CODE.ESC:
				window.removeEventListener('mouseup', this.handlePreviousItemsWindowListener);
				this.resetState();
				break;
			default:
				if (component === 'resultsBox' && curIndex) {
					this.setState({ resultsBoxIndex: 0 });
					this.ctrls['input'].focus();
				}
		}
	};

	render() {
		const itemTitle = this.state.item ? this.state.item.title : '';
		const itemId = itemTitle ? this.state.item.id : '';
		return (
			<div className={bem.b()}>
				<span className="active-item">
					<strong className="item-title">{itemTitle}</strong>
					<em className="item-id">{itemId ? `(id: ${itemId})` : ''}</em>
				</span>
				<form className={bem.e('form')}>
					<div className={bem.e('search')}>
						<input
							className={cx(bem.e('input'), 'default-input')}
							type="text"
							placeholder="Search Item"
							value={this.state.query}
							ref={input => (this.ctrls['input'] = input)}
							onChange={this.handleInputChange}
							onKeyDown={e => this.handleKeyDown(e, 'resultsBox')}
							onClick={this.handleInputClick}
						/>
						<DropdownList
							className="results-box"
							list={this.state.results}
							display={this.state.resultsDisplay}
							ref={resultsBox => (this.ctrls['resultsBox'] = resultsBox)}
							onClick={(e, item) => this.resetState(item)}
							onKeyDown={e => this.handleKeyDown(e, 'resultsBox')}
						/>
					</div>
					<div
						className="previous-items__button"
						tabIndex={0}
						onClick={e => this.handlePreviousItemsClick(e)}
						onMouseUp={e => this.handlePreviousItemsClick(e)}
						onKeyDown={e => this.handleKeyDown(e, 'previousItems')}
					>
						<span>Loaded Items {this.state.previousItemsDisplay ? '▲' : '▼'}</span>
						<DropdownList
							className="previous-items"
							list={this.state.previousItems}
							display={this.state.previousItemsDisplay}
							ref={previousItems => (this.ctrls['previousItems'] = previousItems)}
							onClick={(e, item) => this.resetState(item)}
							onKeyDown={e => this.handleKeyDown(e, 'previousItems')}
						/>
					</div>
					{/*<p className={bem.e('item-title')}>{`${this.state.item ? `${this.state.item.title} (id: ${this.state.item.id})` : ''}`}</p>*/}
				</form>
			</div>
		);
	}
}
