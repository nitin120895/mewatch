import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { UnfocusableRow } from 'ref/tv/focusableInterface';
import sass from 'ref/tv/util/sass';
import EllipsisLabel from 'ref/tv/component/EllipsisLabel';
import './EpisodeInfo.scss';

interface EpisodeInfoProps {
	item: api.ItemSummary;
	index: number;
}

const bem = new Bem('episode-info');

export default class EpisodeInfo extends React.Component<EpisodeInfoProps, any> {
	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	private focusableRow: UnfocusableRow;
	private ref: HTMLDivElement;

	constructor(props) {
		super(props);
		this.focusableRow = new UnfocusableRow(this.props.index);
	}

	componentDidMount() {
		this.focusableRow.height = sass.episodeInfoHeight;
		this.focusableRow.ref = this.ref;
		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	render() {
		const episode = this.props.item;

		if (!episode) return <div />;

		const episodeTitle = episode.episodeNumber + '. ' + (episode.episodeName || episode.title);
		const duration = episode.duration;
		const desc = episode.shortDescription;
		const durationText = Math.floor(duration / 60) + 'min';

		return (
			<div className={bem.b()} ref={ref => (this.ref = ref)}>
				<EllipsisLabel className={bem.e('title')} text={episodeTitle} />
				<EllipsisLabel className={bem.e('desc')} text={desc} />
				<div className={bem.e('duration')}>{durationText}</div>
			</div>
		);
	}
}
