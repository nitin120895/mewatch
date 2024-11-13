import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CrossIcon from 'ref/responsive/component/icons/CrossIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './PopOver.scss';

const bem = new Bem('pop-over');

interface PopOverProps {
	onClosePopOver: () => void;
	nudgeTipbottom: boolean;
}

const CROSS_ICON_SIZE = 13;

const PopOver = ({ onClosePopOver, nudgeTipbottom }: PopOverProps) => {
	return (
		<div className={bem.e('container', { bottom: nudgeTipbottom })}>
			<div className={bem.e('header-wrapper')}>
				<IntlFormatter
					elementType="div"
					className={bem.e('header')}
				>{`@{itemDetail_my_list_nudge_header|Want to watch this later?}`}</IntlFormatter>
				<button onClick={onClosePopOver}>
					<CrossIcon width={CROSS_ICON_SIZE} height={CROSS_ICON_SIZE} />
				</button>
			</div>
			<IntlFormatter>{`@{itemDetail_my_list_nudge_description|Tap to add this programme to your personal list for quick access.}`}</IntlFormatter>
		</div>
	);
};

export default PopOver;
