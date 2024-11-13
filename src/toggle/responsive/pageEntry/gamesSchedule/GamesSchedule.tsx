import * as React from 'react';
import { findDOMNode } from 'react-dom';
import _ from 'lodash';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { bem as gamesEPGItemBEM } from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItem';
import { isAndroid } from 'shared/util/browser';
import { browserHistory } from 'shared/util/browserHistory';
import { get, isEmptyObject } from 'shared/util/objects';
import { throttle } from 'shared/util/performance';
import { isAppWebView, getAppLink } from 'shared/page/pageUtil';
import { getSportsEPG } from 'shared/linear/gamesSchedule';
import { isBetween, formatDateForRequest, getDateFromQueryParam } from 'shared/util/dates';
import { saveGameScheduleFilters, getGameScheduleFilters, removeGameScheduleFilters } from 'toggle/responsive/util/epg';
import { isSmallTabletSize } from 'toggle/responsive/util/grid';
import CtaButton from 'toggle/responsive/component/CtaButton';
import FloatingScrollbarContainer from 'toggle/responsive/component/FloatingScrollbarContainer';
import GamesDatePicker from 'toggle/responsive/pageEntry/gamesSchedule/GamesDatePicker';
import GamesEPGItem from 'toggle/responsive/pageEntry/gamesSchedule/GamesEPGItem';
import Link from 'shared/component/Link';
import SportsSelector from 'toggle/responsive/pageEntry/gamesSchedule/SportsSelector';
import TeamSGToggle from 'toggle/responsive/pageEntry/gamesSchedule/TeamSGToggle';

import './GamesSchedule.scss';

export const bem = new Bem('games-schedule');

export const ALL_SPORTS_ID = 'all-sports';

interface State {
	date: Date;
	startDate?: string;
	endDate?: string;
	schedule: any;
	selectedSports: string[]; // User selected sports
	sportsFilterList: any; // List of available sports filters
	filterBySG: boolean;
	collapseSportsFilter: boolean;
	stickyHeader: boolean;
	stickyHeaderTop: number;
	showFilterBySG: boolean;
}

export default class GamesSchedule extends React.Component<any, State> {
	private header: HTMLElement;
	private throttleOnWindowScroll;

	constructor(props) {
		super(props);

		// Get saved filters if not mobile app webview
		const { location } = this.props;
		let initialDate = new Date();
		let initialSelectedSports = [];
		let initialSGFilter = false;

		if (isAppWebView(location)) {
			if (location && location.query && location.query.date) {
				initialDate = getDateFromQueryParam(location.query.date);
			}
		} else {
			const savedFilters = this.getSavedFilters();
			const { date, selectedSports, filterBySG } = savedFilters;
			if (!isEmptyObject(savedFilters)) {
				initialDate = new Date(date);
				initialSelectedSports = selectedSports;
				initialSGFilter = filterBySG;
			}
		}

		this.state = {
			date: initialDate,
			schedule: {},
			filterBySG: initialSGFilter,
			sportsFilterList: this.getAvailableSportsFilters(),
			selectedSports: initialSelectedSports,
			collapseSportsFilter: isSmallTabletSize(),
			stickyHeader: false,
			showFilterBySG: this.getInitialFilterBySG(),
			stickyHeaderTop: 0
		};

		this.throttleOnWindowScroll = isAndroid() ? throttle(this.onWindowScroll, 15, true) : this.onWindowScroll;
	}

	async componentDidMount() {
		// Get schedule for chosen date (either from previous user saved date or today's date if absent)
		let res = await this.getScheduleByDate(this.state.date);
		const { eventEndDate, eventStartDate } = res;

		// To reset scrollY when user refreshes page
		window.scroll(0, 0);

		this.setState({
			endDate: eventEndDate,
			startDate: eventStartDate
		});

		const start = new Date(eventStartDate);
		const end = new Date(eventEndDate);
		const today = new Date();
		today.setHours(0, 0, 0);

		// If sports event is over, get schedule based on event start date
		if (!isBetween(today, start, end)) {
			this.setState({ date: start });
			res = await this.getScheduleByDate(start);
		}

		if (res.epg) {
			this.setState({ schedule: this.getScheduleBySports(res.epg) });
		}

		// Set initial top position of sticky menu
		this.setState({ stickyHeaderTop: this.header.getBoundingClientRect().top });

		window.addEventListener('scroll', this.throttleOnWindowScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.throttleOnWindowScroll);
	}

	componentDidUpdate(prevProps, prevState) {
		const { date, schedule, selectedSports, filterBySG, stickyHeader } = this.state;
		if (
			prevState.date !== date ||
			prevState.schedule !== schedule ||
			prevState.selectedSports !== selectedSports ||
			prevState.filterBySG !== filterBySG
		) {
			// Need window resize to recalculate scrollbar positions for FloatingScrollbarContainer on change of data/filter
			window.dispatchEvent(new CustomEvent('resize', { bubbles: true, cancelable: false }));
		}

		// Collapse sports filter when user scrolls down and menu sticks
		if (prevState.stickyHeader !== stickyHeader && stickyHeader === true) {
			this.setState({ collapseSportsFilter: true });
		}
	}

	onWindowScroll = e => {
		const { stickyHeaderTop } = this.state;
		this.setState({ stickyHeader: window.pageYOffset >= stickyHeaderTop });
	};

	onHeaderRef = ref => {
		if (!this.header) {
			this.header = findDOMNode(ref);
		}
	};

	getAvailableSportsFilters() {
		return this.props.list.items.map(sport => {
			const thumbnail = get(sport, 'images.custom');
			const title = get(sport, 'title');
			const id = get(sport, 'customFields.sport');
			return {
				id,
				title,
				thumbnail
			};
		});
	}

	getInitialFilterBySG() {
		// Make Filter by SG button configurable in AXIS List item customFields
		const filterBySGField = get(this.props, 'list.customFields.filterSG');
		if (typeof filterBySGField !== 'undefined' && filterBySGField === false) return false;

		return true;
	}

	getScheduleByDate(date) {
		const gamesApiUrl = get(this.props, 'list.customFields.apiUrl');
		return getSportsEPG(`${gamesApiUrl}?date=${formatDateForRequest(date)}`);
	}

	getScheduleBySports(epgList) {
		return _.mapValues(_.groupBy(epgList, 'sport'), clist => clist.map(epg => _.omit(epg, 'sport')));
	}

	handleDateChangeInAppView = date => {
		const params = [];
		params.push('mobileapp=true');
		params.push(`date=${encodeURIComponent(formatDateForRequest(date))}`);
		const query = params.length ? `?${params.join('&')}` : '';
		const path = `${this.props.location.pathname}${query}`;
		browserHistory.replace(path);
	};

	onDateChange = (date: Date) => {
		if (isAppWebView(this.props.location)) {
			this.handleDateChangeInAppView(date);
		}
		this.setState({ date }, () => {
			this.getScheduleByDate(date).then(res => {
				if (res.epg) {
					this.setState({ schedule: this.getScheduleBySports(res.epg) });
				}
			});
		});
	};

	onSelectSport = id => {
		let { selectedSports } = this.state;
		if (id === ALL_SPORTS_ID) {
			selectedSports = [];
		} else {
			const sportIndex = selectedSports.indexOf(id);
			if (sportIndex > -1) {
				selectedSports = selectedSports.filter(sport => sport !== id);
			} else {
				selectedSports = selectedSports.concat([id]);
			}
		}
		this.setState({ selectedSports });
	};

	toggleSGFilter = () => {
		this.setState({ filterBySG: !this.state.filterBySG });
	};

	onToggleSportsSliderDisplay = () => {
		this.setState({ collapseSportsFilter: !this.state.collapseSportsFilter });
	};

	getSavedFilters = () => {
		const savedFilters = getGameScheduleFilters();
		if (!isEmptyObject(savedFilters)) {
			removeGameScheduleFilters();
		}
		return savedFilters;
	};

	saveChosenFilters = () => {
		const { date, selectedSports, filterBySG } = this.state;
		saveGameScheduleFilters({ date, selectedSports, filterBySG });
	};

	renderChannelViewCTA() {
		const { customFields, location } = this.props;
		if (customFields) {
			const { customTagline, moreLinkUrl } = customFields;
			const channelEPGLink = isAppWebView(location) ? getAppLink(moreLinkUrl) : moreLinkUrl;
			if (customTagline && moreLinkUrl) {
				return (
					<Link to={channelEPGLink}>
						<CtaButton>{customTagline}</CtaButton>
					</Link>
				);
			}
		}
		return undefined;
	}

	renderEPGList(sport) {
		const { filterBySG, schedule } = this.state;
		const { id } = sport;
		const { list } = this.props;

		const icsContent = {
			icsDescription: get(list, 'customFields.icsDescription'),
			icsTitle: get(list, 'customFields.icsTitle')
		};

		let programmes = [];
		if (schedule && schedule.hasOwnProperty(id)) {
			programmes = schedule[id];

			if (filterBySG) {
				programmes = programmes.filter(epg => epg.logoFlag === true);
			}
		}

		if (programmes.length === 0) return <div className={gamesEPGItemBEM.b('empty')}>No Event</div>;

		return programmes.map(prog => (
			<GamesEPGItem
				key={prog.id}
				icsContent={icsContent}
				scheduleItem={prog}
				sport={sport}
				saveFilters={this.saveChosenFilters}
			/>
		));
	}

	renderTitle() {
		const { title } = this.props;
		if (!title) return undefined;
		return (
			<div className={cx(bem.e('nav'), 'grid-margin')}>
				<h1 className={bem.e('title')}>{title}</h1>
			</div>
		);
	}

	renderFilterMenu() {
		const {
			collapseSportsFilter,
			date,
			endDate,
			filterBySG,
			selectedSports,
			startDate,
			stickyHeader,
			showFilterBySG
		} = this.state;
		const start = new Date(startDate);
		const end = new Date(endDate);

		return (
			<div className={cx(bem.e('filters-menu'), { sticky: stickyHeader })} ref={this.onHeaderRef}>
				<SportsSelector
					list={this.props.list.items}
					selectedSports={selectedSports}
					onSelectSport={this.onSelectSport}
					isCollapsible={stickyHeader}
					collapsed={collapseSportsFilter}
					onToggleDisplay={this.onToggleSportsSliderDisplay}
				/>
				{startDate && (
					<div className={bem.e('secondary-filters')}>
						<div className="grid-margin">
							<GamesDatePicker onDateChange={this.onDateChange} date={date} startDate={start} endDate={end} />

							{showFilterBySG && <TeamSGToggle isToggleOn={filterBySG} onToggle={this.toggleSGFilter} />}
						</div>
					</div>
				)}
			</div>
		);
	}

	renderEPGTable() {
		const { selectedSports, sportsFilterList, stickyHeader } = this.state;
		let sportsList = sportsFilterList.filter(sport => sport.id !== ALL_SPORTS_ID);
		if (selectedSports.length > 0) {
			sportsList = sportsList.filter(sport => selectedSports.indexOf(sport.id) > -1);
		}

		const paddingTop = stickyHeader ? this.header.offsetHeight : 0;

		return (
			<div className={bem.e('table')} style={{ paddingTop }}>
				<div className={bem.e('categories')}>
					{sportsList.map(sport => {
						const { thumbnail, title, id } = sport;
						return (
							<div className={bem.e('category-item')} key={id}>
								<div className={bem.e('category-thumbnail')}>
									<img src={thumbnail} />
								</div>
								<div className={bem.e('category-title')}>{title}</div>
							</div>
						);
					})}
				</div>
				<FloatingScrollbarContainer>
					<div className={bem.e('programmes')}>
						{sportsList.map(sport => {
							return (
								<div key={sport.id} className={cx(bem.e('programme-list'), sport.id)}>
									{this.renderEPGList(sport)}
								</div>
							);
						})}
					</div>
				</FloatingScrollbarContainer>
			</div>
		);
	}

	render() {
		// tslint:disable-next-line: no-null-keyword
		if (_SSR_) return null;
		return (
			<div className={bem.b()}>
				<div className={bem.e('header')}>
					{this.renderTitle()}
					{this.renderFilterMenu()}
				</div>

				{this.renderEPGTable()}
			</div>
		);
	}
}
