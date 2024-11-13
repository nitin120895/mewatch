import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import EllipsisLabel from 'ref/tv/component/EllipsisLabel';
import './EpisodeDescription.scss';

interface EpisodeDescriptionProps {
	item: api.ItemSummary;
	displayThumbnail: boolean;
	className?: string;
}

const bem = new Bem('d1-episode-desc');

export default class EpisodeDescription extends React.Component<EpisodeDescriptionProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		const { item, className, displayThumbnail } = this.props;
		const description = item.shortDescription;

		return (
			<div className={cx(bem.b(), className)}>
				<EllipsisLabel element="p" className={bem.e('text', { displayThumbnail })} text={description} />
			</div>
		);
	}
}
