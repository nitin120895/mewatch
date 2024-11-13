import * as React from 'react';
import CollapsibleFieldSet from 'viewer/ui/CollapsibleFieldSet';
import warning from 'shared/util/warning';
import { getPage } from 'shared/service/app';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './ListSearch.scss';

interface ListSearchProps {
	onListChange: (Object: api.ItemSummary[]) => void;
	label?: string;
	collapsed?: boolean;
	className?: string;
	listImagesRequired?: boolean;
	childrenPosition?: 'above' | 'below';
}

const listSearch = new Bem('list-search');

/**
 * Loads several lists
 *
 * Because List Ids differ per environment we need to load them in an agnostic way.
 * To achieve this we're loading the homepage data and leveraging the scheduled
 * lists from its page entries.
 */
export default class ListSearch extends React.Component<ListSearchProps, any> {
	private currentKey = ''; // the key for the chosen list
	private currentAmount = 12; // the amount of items to be in any given list
	private listAmount = 5; // the amount of lists to show in dropdown

	static defaultProps = {
		label: 'Data',
		collapsed: true,
		listImagesRequired: false,
		childrenPosition: 'below'
	};

	constructor(props) {
		super(props);

		this.state = {
			results: {},
			itemAmount: this.currentAmount
		};

		getPage('/', {
			listPageSize: this.currentAmount,
			maxListPrefetch: this.listAmount
		}).then(result => {
			let results = {};

			result.data.entries
				.filter((item, i) => item.type === 'ListEntry')
				.slice(0, this.listAmount)
				.sort((a, b) => {
					return a.list.images && !b.list.images ? -1 : b.list.images && !a.list.images ? 1 : 0;
				})
				.forEach(item => (results[item.id] = item.list));

			const keys = Object.keys(results);

			if (!keys.length) {
				if (_DEV_) {
					warning('ListSearch: Aborting - Homepage contains no `ListEntry` scheduled rows.');
				}
				return;
			}

			this.currentKey = keys[0];
			this.setState({ results });
			this.updateList();
		});
	}

	updateList() {
		let chosenList = JSON.parse(JSON.stringify(this.state.results[this.currentKey]));
		if (chosenList.items.length > this.currentAmount) chosenList.items = chosenList.items.slice(0, this.currentAmount);
		this.props.onListChange(chosenList);
	}

	private onOptionChange = e => {
		this.currentKey = e.target.value;
		this.updateList();
	};

	private onInputChange = e => {
		this.currentAmount = e.target.value;
		this.setState({ itemAmount: e.target.value });
		this.updateList();
	};

	render() {
		const { className, label, collapsed, children, childrenPosition } = this.props;
		return (
			<div className={className}>
				<form className={listSearch.b()}>
					<CollapsibleFieldSet label={label} collapsed={collapsed}>
						{childrenPosition === 'above' ? children : false}
						<div className={listSearch.e('input')}>
							<label htmlFor="item-amount">Item Amount</label>
							<input
								id="item-amount"
								className={cx(listSearch.e('item-amount'), 'default-input')}
								type="number"
								onChange={this.onInputChange}
								value={this.state.itemAmount}
							/>
						</div>
						<div className={listSearch.e('input')}>
							<label htmlFor="lists">Lists</label>
							<select id="lists" className={listSearch.e('list')} onChange={this.onOptionChange}>
								{Object.keys(this.state.results).map((key, i) => (
									<option key={i} value={key}>
										List {i + 1}
									</option>
								))}
							</select>
						</div>
						<div className="clearfix" />
						{childrenPosition === 'below' ? children : false}
					</CollapsibleFieldSet>
				</form>
			</div>
		);
	}
}
