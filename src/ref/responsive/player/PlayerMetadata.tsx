import * as React from 'react';
import { Bem } from 'shared/util/styles';
import BackIcon from './controls/icons/BackIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './PlayerMetadata.scss';

const bemPlayerMetadata = new Bem('player-metadata');

interface PlayerMetadataProps {
	title: string;
	children?: React.ReactNode;
	onBack: () => void;
}

export default (props: PlayerMetadataProps) => {
	const { title, children, onBack } = props;

	return (
		<div className={bemPlayerMetadata.b()}>
			<h4 className={bemPlayerMetadata.e('title')}>
				<IntlFormatter
					elementType="button"
					tabIndex={1}
					onClick={onBack}
					className={bemPlayerMetadata.e('back')}
					formattedProps={{ 'aria-label': '@{player_back|Back}' }}
				>
					<BackIcon className={bemPlayerMetadata.e('back-icon')} />
				</IntlFormatter>
				<span className={bemPlayerMetadata.e('name')} onClick={onBack}>
					{title}
				</span>
			</h4>
			{children && <div className={bemPlayerMetadata.e('description')}>{children}</div>}
		</div>
	);
};
