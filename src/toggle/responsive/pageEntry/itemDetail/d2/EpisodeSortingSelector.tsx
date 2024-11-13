import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import Select, { selectBem } from 'toggle/responsive/component/select/Select';
import { connect } from 'react-redux';
import { get } from 'shared/util/objects';

export enum EpisodeSortingOrder {
	earliest = 'earliest',
	latest = 'latest'
}

interface EpisodeSortingSelectorProps {
	onOrderChange: (order: EpisodeSortingOrder) => void;
	setActiveSelector: () => void;
	isActive: boolean;
	itemsAlignLeft?: boolean;
	watchPath: string;
}

interface EpisodeSortingSelectorState {
	order: EpisodeSortingOrder;
}

class EpisodeSortingSelector extends React.Component<
	EpisodeSortingSelectorProps & StateProps,
	EpisodeSortingSelectorState
> {
	private onOptionClick = order => {
		this.props.onOrderChange(order);
	};

	private capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

	render() {
		const { order } = this.props;
		const { setActiveSelector, isActive } = this.props;

		const items: React.ReactElement<any>[] = Object.keys(EpisodeSortingOrder)
			.map(key => EpisodeSortingOrder[key])
			.map(this.renderItem);

		const labelValues = { order: this.capitalize(order) };
		const label = `@{itemDetail_episode_sorting_${order}}`;

		return (
			<Select
				className={selectBem.b('sort')}
				autoExpand={false}
				labelValues={labelValues}
				label={label}
				options={items}
				setActiveSelector={setActiveSelector}
				isActive={isActive}
			/>
		);
	}

	private renderItem = item => {
		const itemClasses: string = cx(
			selectBem.e('item', {
				active: this.props.order === item,
				'item-position-left': this.props.itemsAlignLeft
			})
		);

		return (
			<li
				key={item}
				className={itemClasses}
				onClick={() => {
					this.onOptionClick(item);
				}}
			>
				<IntlFormatter elementType="span" values={{ order: this.capitalize(item) }}>
					{`@{itemDetail_episode_sorting_${item}|{order}}`}
				</IntlFormatter>
			</li>
		);
	};
}

interface StateProps {
	order: string;
}

interface DispatchProps {}

function mapStateToProps(state: state.Root, ownProps): StateProps {
	const { session } = state;
	return {
		order: get(session.filters[ownProps.watchPath], 'order') || EpisodeSortingOrder.earliest
	};
}

const Component: any = connect<StateProps, DispatchProps, any>(mapStateToProps)(EpisodeSortingSelector);

export default Component;
