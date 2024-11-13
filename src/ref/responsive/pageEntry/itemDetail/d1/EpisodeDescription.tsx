import * as React from 'react';
import CollapsibleText from 'ref/responsive/component/CollapsibleText';
import EpisodeInfo from './EpisodeInfo';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './EpisodeDescription.scss';

interface EpisodeDescriptionProps {
	episode: api.ItemSummary;
	showTitle: string;
	className?: string;
	seasonNumber?: number;
	maxLines?: number;
	onExpand?: (episode: api.ItemSummary) => void;
}

const bem = new Bem('d1-ep-desc');

export default class EpisodeDescription extends React.Component<EpisodeDescriptionProps, any> {
	private onExpand = () => {
		this.props.onExpand(this.props.episode);
	};

	render() {
		const { className, episode, maxLines, onExpand } = this.props;
		return (
			<CollapsibleText
				className={cx(bem.b(), className)}
				ariaLabel="@{itemDetail_episodeText_openDescriptionLabel|Open description}"
				renderExpanded={this.renderExpanded}
				maxLines={maxLines}
				onExpand={onExpand ? this.onExpand : undefined}
			>
				<p className={bem.e('text')}>{episode.shortDescription}</p>
			</CollapsibleText>
		);
	}

	private renderExpanded = () => {
		const { showTitle, episode, seasonNumber } = this.props;
		return <EpisodeInfo episode={episode} showTitle={showTitle} seasonNumber={seasonNumber} />;
	};
}
