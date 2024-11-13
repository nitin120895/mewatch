import * as React from 'react';
import * as cx from 'classnames';
import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';

import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import CWMenu from 'toggle/responsive/component/continueWatching/CWMenu';
import CWMenuIcon from 'toggle/responsive/component/icons/CWMenuIcon';
import CWMenuOverlay from 'toggle/responsive/component/continueWatching/CWMenuOverlay';

import './CWPopUp.scss';
interface CWPopUpProps {
	isMenuActive: boolean;
	isShowMenu: boolean;
	onClick: (e: any) => void;
	onInfoClick: (e: any) => void;
	onRemoveItemClick: (e: any) => void;
	handleClickInside: (e: any) => void;
	item?: api.ItemSummary;
	index?: number;
	railPosition?: number;
}

const bem = new Bem('cw-popup');
export class CWPopUp extends React.Component<CWPopUpProps> {
	private renderOverlayMenu = () => {
		const { onInfoClick, handleClickInside, onRemoveItemClick, item, index, railPosition } = this.props;
		return (
			<CWMenuOverlay>
				<CWMenu
					onInfoClick={onInfoClick}
					handleClickInside={handleClickInside}
					onRemoveItemClick={onRemoveItemClick}
					item={item}
					index={index}
					railPosition={railPosition}
				/>
			</CWMenuOverlay>
		);
	};

	private wrapButtonCTA = children => {
		const { item, index, isShowMenu, railPosition } = this.props;
		if (isShowMenu) {
			return children;
		}

		return (
			<CTAWrapper type={CTATypes.CWMenu} data={{ item, index, railPosition }}>
				{children}
			</CTAWrapper>
		);
	};

	render() {
		const { onClick, isMenuActive, isShowMenu } = this.props;
		return (
			<div onClick={onClick} className={cx(bem.b({ active: isMenuActive }))}>
				{this.wrapButtonCTA(
					<button className={bem.e('btn')}>
						<CWMenuIcon key="CWMenuIcon" />
					</button>
				)}
				{isShowMenu && this.renderOverlayMenu()}
			</div>
		);
	}
}

export default CWPopUp;
