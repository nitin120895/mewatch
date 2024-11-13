import * as React from 'react';
import ScrollableList from 'ref/tv/component/ScrollableList';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { focusedClass } from 'ref/tv/util/focusUtil';
import sass from 'ref/tv/util/sass';

import './SeasonSelector.scss';

interface SeasonSelectorProps {
	index: number;
	seasons: api.ItemSummary[];
	focusChanged?: (index: number) => void;
	selectedIndex?: number;
}

const bem = new Bem('season-selector');

export default class SeasonSelector extends React.Component<SeasonSelectorProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			selectedIndex: props.selectedIndex || 0
		};
	}

	componentWillReceiveProps(nextProps: SeasonSelectorProps) {
		if (nextProps.selectedIndex !== this.state.selectedIndex) {
			this.setState({ selectedIndex: nextProps.selectedIndex });
		}
	}

	private onFocusChanged = (index: number) => {
		this.setState({ selectedIndex: index });
		this.props.focusChanged && this.props.focusChanged(index);
	};

	render() {
		const { seasons } = this.props;
		if (!seasons || !seasons.length) {
			return false;
		}

		const items = seasons.map((s, i) => {
			const focused = i === this.state.selectedIndex;
			return (
				<div className={cx(bem.e('season'), focused ? focusedClass : '')} key={`Season ${s.seasonNumber}`}>
					<div
						className={cx(bem.e('season-content'), focused ? focusedClass : '')}
						onClick={() => this.onFocusChanged(i)}
					>{`Season ${s.seasonNumber}`}</div>
					<div className={cx(bem.e('bar'), focused ? focusedClass : '')} />
				</div>
			);
		});

		return (
			<div className={bem.b()}>
				<ScrollableList
					items={items}
					index={this.props.index}
					selectedIndex={this.state.selectedIndex}
					itemWidth={sass.seasonSelectorItemWidth}
					itemSpace={0}
					focusChanged={this.onFocusChanged}
					refRowType={'detail'}
					rowHeight={sass.seasonSelectorHeight}
					scrollableListHeight={sass.seasonSelectorHeight}
				/>
			</div>
		);
	}
}
