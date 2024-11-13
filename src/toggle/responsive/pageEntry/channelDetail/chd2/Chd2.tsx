import * as React from 'react';
import * as cx from 'classnames';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';
import { CHD2 as template } from 'shared/page/pageEntryTemplate';
import { getColumnClasses } from 'ref/responsive/util/grid';
import Scrollable from 'ref/responsive/component/Scrollable';
import EntryTitle from '../../../component/EntryTitle';
import Chd2ItemImage from './Chd2ItemImage';
import ScheduleError from '../components/ScheduleError';
import { withChannelSchedule, ChannelScheduleProps } from '../../../component/ChannelSchedule';
import { MAX_NUMBER_OF_TILES } from 'toggle/responsive/util/channelUtil';

import './Chd2.scss';

const bem = new Bem('chd2');
const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

interface Props extends PageEntryListProps {
	schedules: api.ItemSchedule[];
	item: api.ItemSummary;
}

class CHD2 extends React.PureComponent<Props> {
	private scroller: Scrollable;
	private itemColumnClasses = getColumnClasses(columns);

	componentDidUpdate(prevProps: Props) {
		if (prevProps.schedules !== this.props.schedules) {
			this.restoreScrollPosition();
		}
	}

	private restoreScrollPosition() {
		const { savedState, schedules } = this.props;
		if (this.scroller && savedState && schedules && schedules.length > 0) {
			this.scroller.restoreScrollPosition(savedState.scrollX || 0);
		}
	}

	private onScroll = (scrollX: number) => {
		const { savedState } = this.props;
		if (savedState) savedState.scrollX = scrollX;
	};

	private onScrollerRef = ref => (this.scroller = ref);

	render() {
		const { schedules, loading } = this.props;
		const noSchedules = !schedules || (schedules && !schedules.length);

		return (
			<div className={bem.b()}>
				<EntryTitle {...this.props} disableLink={true} headingClassName={bem.e('title')} />
				{noSchedules && !loading ? (
					<ScheduleError />
				) : (
					<Scrollable className="row-peek" length={schedules.length} onScroll={this.onScroll} ref={this.onScrollerRef}>
						{schedules.slice(0, MAX_NUMBER_OF_TILES - 1).map((schedule, key) => this.renderColumn(schedule, key))}
					</Scrollable>
				)}
			</div>
		);
	}

	private renderColumn = (schedule: api.ItemSchedule, index: number) => {
		const { loading, customFields, item, schedules } = this.props;

		const renderItemComponent = () => {
			return (
				<Chd2ItemImage
					key={schedule.id}
					className={cx(bem.e('item'), ...this.itemColumnClasses)}
					schedule={schedule}
					loading={!!loading}
					customFields={customFields}
					first={!index}
					channel={item}
					index={index}
					item={schedule}
					totalScheduleCount={schedules.length}
				/>
			);
		};

		if (!index) {
			return (
				<CTAWrapper key={schedule.id} type={CTATypes.Watch} data={{ item: { ...item, scheduleItem: schedule } }}>
					{renderItemComponent()}
				</CTAWrapper>
			);
		}

		return renderItemComponent();
	};
}

const Component: React.ComponentClass<ChannelScheduleProps> & { template?: string } = withChannelSchedule<{}>(
	MAX_NUMBER_OF_TILES
)(CHD2);
Component.template = template;

export default Component;
