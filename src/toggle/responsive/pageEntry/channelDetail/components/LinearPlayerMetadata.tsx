import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { get } from 'shared/util/objects';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { FormattedTime } from 'react-intl';

import './LinearPlayerMetadata.scss';

const bem = new Bem('linear-player-metadata');

interface PlayerMetadataProps {
	children?: React.ReactNode;
	onBack?: () => void;
	className?: string;
	item?: api.ItemSummary;
	currentProgram?: api.ItemSchedule;
}

export default (props: PlayerMetadataProps) => {
	const { children, className, item, currentProgram } = props;
	const title = get(currentProgram, 'item.title') || item.title;
	const secondaryLanguageTitle = get(currentProgram, 'item.secondaryLanguageTitle') || '';
	const startDate = get(currentProgram, 'startDate');
	const endDate = get(currentProgram, 'endDate');

	return (
		<div className={cx(className, bem.b())}>
			<div className={bem.e('time')}>
				<IntlFormatter>{item.title}</IntlFormatter>
				{' | '}
				{startDate && <FormattedTime value={startDate} />}
				{' - '}
				{endDate && <FormattedTime value={endDate} />}
			</div>
			<div className={bem.e('title')}>{title}</div>
			{secondaryLanguageTitle && <div className={bem.e('secondary-title')}>{secondaryLanguageTitle}</div>}
			{children}
		</div>
	);
};
