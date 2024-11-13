import * as React from 'react';

import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';

import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CWInfoIcon from 'toggle/responsive/component/icons/CWInfoIcon';
import DeleteIcon from 'toggle/responsive/component/icons/DeleteIcon';

import './CWMenu.scss';

const bem = new Bem('cw-menu');

interface CWMenuProps {
	onInfoClick: (e) => void;
	handleClickInside: (e) => void;
	onRemoveItemClick: (e) => void;
	item?: api.ItemSummary;
	index?: number;
	railPosition?: number;
}

export class CWMenu extends React.Component<CWMenuProps> {
	private renderInfoButton = () => {
		const { onInfoClick, item, index, railPosition } = this.props;
		return (
			<CTAWrapper type={CTATypes.CWMenuViewInfo} data={{ item, index, railPosition }}>
				<div className={bem.e('item')} onClick={onInfoClick}>
					<span className={bem.e('icon')}>
						<CWInfoIcon width={20} height={21} />
					</span>
					<IntlFormatter className={bem.e('text')}>{`@{continue_watching_more_info|View more Info}`}</IntlFormatter>
				</div>
			</CTAWrapper>
		);
	};

	private renderDeleteButton = () => {
		const { onRemoveItemClick, item, index, railPosition } = this.props;
		return (
			<CTAWrapper type={CTATypes.CWMenuRemoveCW} data={{ item, index, railPosition }}>
				<div className={bem.e('item')} onClick={onRemoveItemClick}>
					<span className={bem.e('icon')}>
						<DeleteIcon width={20} height={21} />
					</span>

					<IntlFormatter
						className={bem.e('text')}
					>{`@{continue_watching_remove|Remove from Continue Watching}`}</IntlFormatter>
				</div>
			</CTAWrapper>
		);
	};

	render() {
		const { handleClickInside } = this.props;
		return (
			<div className={bem.e('container')} onClick={handleClickInside}>
				{this.renderInfoButton()}
				{this.renderDeleteButton()}
			</div>
		);
	}
}

export default CWMenu;
