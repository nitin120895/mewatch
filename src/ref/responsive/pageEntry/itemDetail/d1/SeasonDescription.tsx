import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import CollapsibleText from 'ref/responsive/component/CollapsibleText';

import './SeasonDescription.scss';

interface SeasonDescriptionProps {
	item: api.ItemSummary;
	className?: string;
}

const bem = new Bem('d1-season-desc');

export default ({ className, item }: SeasonDescriptionProps) => {
	const { description } = item as api.ItemDetail;
	return (
		<CollapsibleText
			className={cx(bem.b(), className)}
			ariaLabel="@{itemDetail_episodeText_openDescriptionLabel|Open description}"
			maxLines={4}
		>
			<p className={bem.e('text')}>{description}</p>
		</CollapsibleText>
	);
};
