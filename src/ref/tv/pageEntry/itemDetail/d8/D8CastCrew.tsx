import * as React from 'react';
import * as PropTypes from 'prop-types';
import ScrollableList from 'ref/tv/component/ScrollableList';
import { Bem } from 'shared/util/styles';
import D8CastCrewItem from './D8CastCrewItem';
import sass from 'ref/tv/util/sass';
import './D8CastCrew.scss';

const MAX_ACTORS = 30;
const bem = new Bem('d8-cast-crew');

export default class D8CastCrew extends React.Component<PageEntryItemProps, any> {
	context: {
		router: ReactRouter.InjectedRouter;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired
	};

	private actors: api.Credit[] = [];

	constructor(props) {
		super(props);
		this.state = {
			selectedIndex: 0
		};
	}

	private onFocusChanged = (index: number) => {
		this.setState({
			selectedIndex: index
		});
	};

	private invokeItem = (index: number) => {
		this.context.router.push(this.actors[index].path);
	};

	render() {
		const item = this.props.item as api.ItemDetail;
		let credits: api.Credit[];
		let ignoreRole = false;
		if (item) {
			credits = item.credits || [];
		} else {
			ignoreRole = true;
			credits = (this.props as PageEntryPeopleProps).people;
		}

		this.actors = credits.filter(credit => credit.role === 'actor' || ignoreRole).slice(0, MAX_ACTORS);

		const items = this.actors.map((a, i) => {
			const focused = i === this.state.selectedIndex;

			return (
				<D8CastCrewItem
					key={`d8-cast-crew-${i}`}
					item={a}
					focused={focused}
					index={i}
					onMouseEnter={this.onFocusChanged}
					onClick={this.invokeItem}
				/>
			);
		});

		if (this.actors.length > 0) {
			return (
				<div className={bem.b()}>
					{this.props.title && <div className={bem.e('title')}>{this.props.title}</div>}
					<ScrollableList
						{...this.props}
						items={items}
						index={(this.props.index + 1) * 10}
						rowIndex={this.props.index}
						selectedIndex={this.state.selectedIndex}
						itemWidth={sass.castCrewImageWidth + sass.itemMargin}
						itemSpace={sass.itemMargin}
						focusChanged={this.onFocusChanged}
						invokeItem={this.invokeItem}
						refRowType={'detail'}
						entryProps={this.props}
						rowHeight={this.props.title ? sass.d8Height + sass.d8TitleHeight : sass.d8Height}
						scrollableListHeight={sass.d8Height}
						template={this.props.template}
					/>
				</div>
			);
		}

		return <div />;
	}
}
