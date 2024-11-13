import * as cx from 'classnames';
import * as React from 'react';
import Packshot from 'ref/responsive/component/Packshot';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import { CTATypes } from 'shared/analytics/types/types';
import Link from 'shared/component/Link';
import { Bem } from 'shared/util/styles';
import { calculateMedianWidth, getColumnClasses } from '../../../util/grid';
import { canPlay } from '../../util/offer';
import { getEpisodeDetailImageTypes } from '../util/episodeImages';
import { renderPrice } from '../util/episodePrice';
import EpisodeDescription from './EpisodeDescription';

import './EpisodeGridItem.scss';

interface EpisodeGridItemProps {
	className?: string;
	episode: api.ItemSummary;
	showTitle: string;
	index?: number;
	isSelected: boolean;
	seasonNumber?: number;
	displayDescription?: boolean;
	columns?: grid.BreakpointColumn[];
	onExpand?: (episode: api.ItemSummary) => void;
	allowEpisodeLinks?: boolean;
}

interface EpisodeGridItemState {
	medianColumnWidth?: number;
}

const bem = new Bem('d1-episode');

export default class EpisodeGridItem extends React.Component<EpisodeGridItemProps, EpisodeGridItemState> {
	static defaultProps = {
		columns: [{ phone: 24 }, { phablet: 12 }, { laptop: 8 }, { desktopWide: 6 }]
	};

	constructor(props) {
		super(props);

		this.state = {
			medianColumnWidth: calculateMedianWidth(props.columns)
		};
	}

	componentWillReceiveProps(nextProps: EpisodeGridItemProps) {
		const columns = nextProps.columns;
		if (!this.state.medianColumnWidth && columns && columns.length) {
			this.setState({ medianColumnWidth: calculateMedianWidth(columns) });
		}
	}

	private onPurchase = () => {
		// stub
	};

	render() {
		const { className, columns, allowEpisodeLinks } = this.props;
		const episode = this.props.episode as api.ItemDetail;
		const to: string = canPlay(episode) ? episode.watchPath : allowEpisodeLinks ? episode.path : undefined;
		return (
			<div className={cx(bem.b(), ...getColumnClasses(columns), className)}>
				<div className={bem.e('packshot-group')}>
					{to ? (
						<CTAWrapper type={CTATypes.Watch} data={{ item: episode }}>
							<Link className={bem.e('packshot-link')} to={to}>
								{this.renderTitledPackshot(episode, true)}
							</Link>
						</CTAWrapper>
					) : (
						<div>{this.renderTitledPackshot(episode, false)}</div>
					)}
					{this.renderPrice(episode)}
				</div>
				{this.renderDescription()}
			</div>
		);
	}

	private renderTitledPackshot(episode: api.ItemDetail, hasPath: boolean) {
		const { index, isSelected } = this.props;
		const imageOptions: image.Options = {
			width: this.state.medianColumnWidth || 200
		};
		return [
			<div key={`titles-${episode.id}`} className={bem.e('title-group')} aria-hidden={true}>
				<div className={bem.e('number')}>{episode.episodeNumber}</div>
				<div className={bem.e('title')}>{episode.episodeName}</div>
			</div>,
			<Packshot
				className={bem.e('packshot')}
				key={`ps-${episode.id}`}
				index={index}
				item={episode}
				selected={isSelected}
				imageType={getEpisodeDetailImageTypes(episode)}
				imageOptions={imageOptions}
				tabEnabled
				ignoreLink
				allowProgressBar
				hasOverlay={hasPath}
				hasImageShadow
				allowWatch
				isEpisodeItem
			/>
		];
	}

	private renderDescription() {
		const { episode, seasonNumber, displayDescription, onExpand } = this.props;
		if (!displayDescription) return false;
		return (
			<EpisodeDescription
				className={bem.e('description')}
				showTitle={this.props.showTitle}
				episode={episode}
				seasonNumber={seasonNumber}
				maxLines={2}
				onExpand={onExpand}
			/>
		);
	}

	// Shared between GridItem / ListItem
	private renderPrice(episode) {
		return renderPrice(episode, this.onPurchase);
	}
}
