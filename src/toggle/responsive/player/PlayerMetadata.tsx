import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './PlayerMetadata.scss';

const bem = new Bem('player-metadata');
const bem2 = new Bem('title-container');

interface PlayerMetadataProps {
	title: string;
	secondaryTitle?: string;
	children?: React.ReactNode;
	onBack?: () => void;
	className?: string;
}

export default (props: PlayerMetadataProps) => {
	const { title, secondaryTitle, children, onBack, className } = props;

	return (
		<div className={cx(className, bem.b())}>
			<h4 className={cx(bem.e('title'), bem2.b())}>
				<span className={bem2.e('text')} onClick={onBack}>
					{title}
				</span>
			</h4>
			{secondaryTitle && <h5 className={bem.e('secondary-title')}>{secondaryTitle}</h5>}
			<div className={bem.e('description')}>{children}</div>
		</div>
	);
};
