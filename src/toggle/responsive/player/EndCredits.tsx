import * as React from 'react';
import { Bem } from 'shared/util/styles';
import PlayIcon from 'ref/responsive/player/controls/icons/PlayIcon';
import CtaButton from 'ref/responsive/component/CtaButton';
import IntlFormatter from 'ref/tv/component/IntlFormatter';

import './EndCredits.scss';

interface Props {
	onClickWatchCredits: () => void;
	onClickNextEpisode: () => void;
	shouldHideNextEpisodeBtn: boolean;
}

const bem = new Bem('end-credits');
export default class EndCredits extends React.PureComponent<Props> {
	render() {
		const { onClickWatchCredits, onClickNextEpisode, shouldHideNextEpisodeBtn } = this.props;

		return (
			<div className={bem.b()}>
				{!shouldHideNextEpisodeBtn && (
					<CtaButton onClick={onClickNextEpisode} ordinal="primary" className={bem.e('btn', 'margin-left')}>
						<div className={bem.e('icon')}>
							<PlayIcon /> {'|'}
						</div>
						<IntlFormatter>{'@{itemDetail_labels_next_episode}'}</IntlFormatter>
					</CtaButton>
				)}
				<CtaButton onClick={onClickWatchCredits} ordinal="naked" className={bem.e('btn', 'border')}>
					<IntlFormatter>{'@{end_credits_watch_label}'}</IntlFormatter>
				</CtaButton>
			</div>
		);
	}
}
