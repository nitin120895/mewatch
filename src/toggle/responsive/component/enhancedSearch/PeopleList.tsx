import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { getColumnClasses } from 'ref/responsive/util/grid';
import { get } from 'shared/util/objects';
import CastMember from 'toggle/responsive/component/enhancedSearch/CastMember';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import Scrollable from 'toggle/responsive/component/Scrollable';
import './PeopleList.scss';

const columns = [{ phone: 7 }, { phablet: 5 }, { tablet: 4 }, { laptop: 3 }, { uhd: 2 }];

const bem = new Bem('people-list');

interface PeopleListProps extends PageEntryListProps {
	children?: React.ReactNode;
}

export default class PeopleList extends React.PureComponent<PeopleListProps, any> {
	private scroller: Scrollable;

	componentDidMount() {
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		const prevItems = get(prevProps, 'list.items');
		const currentItems = get(this.props, 'list.items');

		if (prevItems !== currentItems) {
			this.restoreScrollPosition();
		}
	}

	private restoreScrollPosition() {
		const { savedState, list } = this.props;
		const { items } = list;
		if (this.scroller && savedState && list && items && items.length > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private onScroll = (scrollX: number) => {
		const { savedState } = this.props;
		if (savedState) savedState.scrollX = scrollX;
	};

	private onScrollerRef = ref => (this.scroller = ref);

	private renderPerson = (person, index: number) => {
		return <CastMember key={`credit-${index}`} item={person} className={cx(...getColumnClasses(columns))} />;
	};

	render() {
		const { list } = this.props;
		const peopleGroup = list.items && list.items.length > 0 ? list.items : [];
		return (
			<div className={bem.b()}>
				<EntryTitle {...this.props} />
				<Scrollable
					className={cx(bem.e('list'), 'row-peek')}
					length={peopleGroup.length}
					onScroll={this.onScroll}
					ref={this.onScrollerRef}
				>
					{peopleGroup.map(this.renderPerson)}
				</Scrollable>
			</div>
		);
	}
}
