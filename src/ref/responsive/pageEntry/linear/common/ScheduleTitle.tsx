import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './ScheduleTitle.scss';

interface ScheduleTitleProps {
	title: string;
	showTitle?: string;
	season: number;
	episode: number;
	isEpisode?: boolean;
}

const bem = new Bem('schedule-title');

export default class ScheduleTitle extends React.Component<ScheduleTitleProps, any> {
	render() {
		return (
			<div className={bem.b()}>
				{this.renderTitle()}
				{this.renderSubtitle()}
			</div>
		);
	}

	private renderTitle() {
		const { title, showTitle, isEpisode } = this.props;
		const scheduleTitle = isEpisode ? showTitle : title;

		return <div className={cx(bem.e('title'), 'truncate')}>{scheduleTitle}</div>;
	}

	private renderSubtitle() {
		const { season, episode, isEpisode } = this.props;

		if (!isEpisode) return false;

		return (
			<IntlFormatter elementType="div" className={cx(bem.e('subtitle'), 'truncate')} values={{ season, episode }}>
				{`@{channel_season_title|Season {season} – Episode {episode}}`}
			</IntlFormatter>
		);
	}
}
