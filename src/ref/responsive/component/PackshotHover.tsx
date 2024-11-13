import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import RatingWrapper from 'ref/responsive/component/rating/RatingWrapper';
import { getItemProgress } from '../util/item';
import ProgressBar from 'ref/responsive/component/ProgressBar';
import { truncateText } from 'ref/responsive/util/text';
import { browserHistory } from 'shared/util/browserHistory';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { IntlValues } from './IntlFormatter';

import './PackshotHover.scss';

interface PackshotHoverProps extends React.HTMLProps<any> {
	item: api.ItemSummary;
	active: boolean;
	hasRate?: boolean;
	hasProgress?: boolean;
	onHoverClick?: (e: React.SyntheticEvent<any>) => void;
}

interface PackshotHoverState {
	hiding: boolean;
	show: boolean;
}

const bem = new Bem('packshot-hover');

/**
 * Packshot hover popup
 *
 * Displays packshot hover popup when user moves mouse over packshot.
 * Hover popup includes item title, subtitle, truncated description, rating and progress bar.
 *
 * The width of the hover popup is dynamic. In most cases, there is minimumwidth for all types of packshots
 * and for wider packshots hover popup has the same width. Some width corrections have been done for account page due to small packshots widths.
 *
 * All size/position settings for hover popups have been implemented in css only.
 *
 */
export default class PackshotHover extends React.Component<PackshotHoverProps, PackshotHoverState> {
	static defaultProps = {
		hasRate: true,
		hasProgress: true
	};

	HIDE_DELAY = 300;
	SHOW_DELAY = 300;

	private description: HTMLElement;
	private timeout: any;

	state = {
		hiding: false,
		show: false
	};

	componentDidMount() {
		if (this.props.active) {
			this.timeout = setTimeout(() => {
				this.setState({ show: true, hiding: false });
			}, this.SHOW_DELAY);
		}
	}

	componentDidUpdate(prevProps: PackshotHoverProps, prevState: PackshotHoverState) {
		const { active } = this.props;

		if (!prevState.show && this.state.show) {
			this.truncateText();
		}

		if (!prevProps.active && active) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.setState({ show: true, hiding: false });
			}, this.SHOW_DELAY);
		}

		if (prevProps.active && !active) {
			clearTimeout(this.timeout);
			if (this.state.show) {
				this.setState({ hiding: true });
				this.timeout = setTimeout(() => {
					this.setState({ hiding: false, show: false });
				}, this.HIDE_DELAY);
			}
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	private truncateText = () => {
		if (this.description) {
			truncateText(this.description, this.props.item.shortDescription);
		}
	};

	private onDescriptionRef = (ref: HTMLElement) => {
		this.description = ref;
	};

	private onHoverClick = e => {
		const { item, onHoverClick } = this.props;

		if (onHoverClick) {
			onHoverClick(e);
			return;
		}

		e.preventDefault();
		browserHistory.push(item.path);
	};

	render() {
		const { item } = this.props;
		const { hiding, show } = this.state;

		if (!item || !show) return false;

		return (
			<div className={cx(bem.b(hiding ? 'hide' : show ? 'show' : undefined))} onClick={this.onHoverClick}>
				{this.renderTitle(item)}
				{this.renderSubTitle(item)}
				{this.renderRatingWrapper('rating', item)}
				{this.renderProgressBar(item)}
				{this.renderDescription()}
			</div>
		);
	}

	private renderTitle(item: api.ItemSummary) {
		return <div className={bem.e('title')}>{item.title}</div>;
	}

	private renderSubTitle(item: api.ItemSummary) {
		let subTitle: string;
		let subTitleValues: IntlValues;

		switch (item.type) {
			case 'show':
				if (item.customFields && item.customFields.episode && item.customFields.season) {
					const {
						episode: { episodeNumber },
						season: { seasonNumber }
					} = item.customFields;
					subTitleValues = { season: seasonNumber, episode: episodeNumber };
					subTitle = `@{hover_episode_title|S{season} E{episode}}`;
				} else {
					const { availableSeasonCount } = item;
					subTitleValues = { seasonsCount: availableSeasonCount };
					subTitle = availableSeasonCount === 1 ? `@{hover_show_season_title}` : `@{hover_show_seasons_title}`;
				}
				break;
			case 'season':
				subTitleValues = { season: item.seasonNumber, episode: item.episodeCount };
				subTitle = `@{hover_season_title}`;
				break;
			case 'episode':
				subTitleValues = { season: item.seasonNumber, episode: item.episodeNumber };
				subTitle = item.seasonNumber ? `@{hover_episode_title}` : `@{hover_episode_noseason_title}`;
				break;
		}

		if (subTitle) {
			return (
				<IntlFormatter elementType="div" className={bem.e('subtitle')} values={subTitleValues}>
					{subTitle}
				</IntlFormatter>
			);
		}

		return false;
	}

	private renderRatingWrapper = (component: string, item: api.ItemSummary) => {
		return this.props.hasRate && <RatingWrapper item={item} component={component} />;
	};

	private renderProgressBar(item: api.ItemSummary) {
		const progress = getItemProgress(item);
		return this.props.hasProgress && progress > 0 && <ProgressBar progress={progress} className={bem.e('progress')} />;
	}

	private renderDescription() {
		return (
			<div className={bem.e('text')} ref={this.onDescriptionRef}>
				{this.props.item.shortDescription}
			</div>
		);
	}
}
