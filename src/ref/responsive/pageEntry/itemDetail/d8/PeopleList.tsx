import * as React from 'react';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { getColumnClasses } from 'ref/responsive/util/grid';
import CastMember from './CastMember';
import Scrollable from '../../../component/Scrollable';
import * as cx from 'classnames';

import './PeopleList.scss';

const columns = [{ phone: 7 }, { phablet: 5 }, { tablet: 4 }, { laptop: 3 }, { uhd: 2 }];

export default class PeopleList extends React.PureComponent<PageEntryPeopleProps, any> {
	private scroller: Scrollable;

	componentDidMount() {
		this.restoreScrollPosition();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.people !== this.props.people) {
			this.restoreScrollPosition();
		}
	}

	private restoreScrollPosition() {
		const { savedState, people } = this.props;
		if (this.scroller && savedState && people && people.length > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private onScroll = (scrollX: number) => {
		const { savedState } = this.props;
		if (savedState) savedState.scrollX = scrollX;
	};

	private onScrollerRef = ref => (this.scroller = ref);

	render() {
		const { people } = this.props;
		return (
			<div className="people-list">
				<EntryTitle {...this.props} />
				<Scrollable
					className={cx('people-list__list', 'row-peek')}
					length={people.length}
					onScroll={this.onScroll}
					ref={this.onScrollerRef}
				>
					{this.props.people.map(this.renderPerson)}
				</Scrollable>
			</div>
		);
	}

	private renderPerson = (person: api.Credit, index: number) => {
		return (
			<CastMember key={`credit-${person.key || index}`} credit={person} className={cx(...getColumnClasses(columns))} />
		);
	};
}
