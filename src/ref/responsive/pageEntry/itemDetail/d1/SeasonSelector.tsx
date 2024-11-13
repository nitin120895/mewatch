import * as React from 'react';
import { findDOMNode } from 'react-dom';
import SeasonList from './SeasonList';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { isMobileSize, getColumnClasses } from '../../../util/grid';

import './SeasonSelector.scss';

export type SeasonSelectorPosition = 'left' | 'right';

interface SeasonSelectorProps {
	className?: string;
	seasons: api.ItemSummary[];
	selectedSeasonId: string;
	position?: SeasonSelectorPosition;
	reverse?: boolean;
	autoExpand?: boolean;
}

interface SeasonSelectorState {
	expanded?: boolean;
	isDropdown?: boolean;
	isMobile?: boolean;
}

const LIST_COLUMNS = [{ phone: 8 }, { phablet: 6 }, { tablet: 4 }, { laptop: 3 }, { desktopWide: 2 }];

const bem = new Bem('d1-season-selector');

export default class SeasonSelector extends React.Component<SeasonSelectorProps, SeasonSelectorState> {
	static defaultProps = {
		position: 'left',
		autoExpand: true,
		isMobile: false
	};

	private list: HTMLElement;
	private activeItem: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			expanded: false,
			isDropdown: !props.autoExpand
		};
	}

	componentDidMount() {
		if (this.props.autoExpand) {
			window.addEventListener('resize', this.onResize, false);
			this.onResize();
		}
	}

	componentWillUnmount() {
		if (this.props.autoExpand) {
			window.removeEventListener('resize', this.onResize);
		}
	}

	private closeSeasonList() {
		this.setState({ expanded: false });
	}

	private toggleSeasonList() {
		this.setState({ expanded: !this.state.expanded });
	}

	private scrollToActiveItem() {
		if (!this.list || !this.activeItem) return;
		// Scroll season list to the right place to display current season
		// Check whether the active item is off screen by checking its position
		const activeRight = this.activeItem.offsetLeft + this.activeItem.offsetWidth;
		const listRight = this.list.scrollLeft + this.list.offsetWidth;
		if (activeRight > listRight) {
			this.list.scrollLeft = this.activeItem.offsetLeft;
		}
	}

	private onResize = () => {
		const isMobile = isMobileSize();
		const { expanded, isDropdown } = this.state;
		this.setState({ isMobile });
		if (!isMobile && (!expanded || isDropdown)) {
			// Not mobile size, should auto expand to list
			window.requestAnimationFrame(this.onAutoExpand);
		} else if (isMobile && !isDropdown) {
			// In mobile size, and not dropdown, should close and change to dropdown
			window.requestAnimationFrame(this.onAutoClose);
		}
	};

	private onAutoExpand = () => {
		this.setState({ expanded: true, isDropdown: false });
		this.scrollToActiveItem();
	};

	private onAutoClose = () => {
		this.setState({ expanded: false, isDropdown: true });
	};

	private onListReference = (ref: SeasonList) => {
		this.list = ref ? findDOMNode<HTMLElement>(ref) : undefined;
		if (this.list) {
			this.activeItem = this.list.querySelector('.season-list__item--active') as HTMLElement;
		}
	};

	private onEscape = () => {
		this.closeSeasonList();
	};

	private onClick = e => {
		if (this.state.expanded) {
			this.closeSeasonList();
		}
	};

	private onButtonClick = e => {
		e.stopPropagation();
		this.toggleSeasonList();
	};

	render() {
		const { className, seasons, selectedSeasonId, position, reverse, autoExpand } = this.props;
		if (!seasons || !seasons.length) {
			return false;
		}

		const { expanded, isDropdown, isMobile } = this.state;
		const isDropdownExpanded = expanded && isDropdown;
		const selectedSeason = seasons.find(season => season.id === selectedSeasonId);
		const seasonNumber = selectedSeason ? selectedSeason.seasonNumber : '';
		const blockClasses = bem.b(position, {
			expanded: isDropdownExpanded,
			'drop-down': isDropdown,
			'auto-expand': autoExpand
		});
		const classes = cx(
			blockClasses,
			{
				clearfix: position === 'right',
				'row-peek': isDropdownExpanded
			},
			className
		);
		return (
			<div className={classes} onClick={this.onClick}>
				<FocusCaptureGroup focusable={isDropdownExpanded} onEscape={this.onEscape}>
					<IntlFormatter
						elementType="button"
						type="button"
						className={bem.e('button')}
						onClick={this.onButtonClick}
						aria-haspopup="true"
						aria-controls="seasonListContainer"
						aria-expanded={expanded}
						values={{ season: seasonNumber }}
					>
						{'@{itemDetail_seasonList_season_label|Season {season}}'}
					</IntlFormatter>
					<div id="seasonListContainer" className={bem.e('listContainer')} aria-expanded={expanded}>
						<SeasonList
							ref={this.onListReference}
							seasons={seasons}
							selectedSeasonId={selectedSeasonId}
							itemClassName={cx(getColumnClasses(LIST_COLUMNS))}
							reverse={reverse}
							scrollable={autoExpand && !isMobile}
						/>
					</div>
				</FocusCaptureGroup>
			</div>
		);
	}
}
