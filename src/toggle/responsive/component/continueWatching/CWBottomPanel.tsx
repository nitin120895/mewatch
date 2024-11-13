import * as React from 'react';
import { Bem } from 'shared/util/styles';

import CloseIcon from 'toggle/responsive/component/modal/CloseIcon';
import CWMenu from 'toggle/responsive/component/continueWatching/CWMenu';

import './CWBottomPanel.scss';

const bem = new Bem('cw-bottom-panel');

export interface CWBottomPanelProps {
	title: string;
	id: string;
	onClose?: (id: string) => void;
	secondaryLanguageTitle?: string;
	onInfoClick?: (e) => void;
	onRemoveItemClick: (item: any) => void;
	handleClickInside?: (e: any) => void;
	item?: api.ItemSummary;
	index?: number;
	railPosition?: number;
}

export class CWBottomPanel extends React.Component<CWBottomPanelProps> {
	render() {
		const {
			onInfoClick,
			title,
			secondaryLanguageTitle,
			handleClickInside,
			onClose,
			id,
			item,
			index,
			railPosition
		} = this.props;
		if (!id) return;

		return (
			<div className={bem.b()}>
				<div className={bem.e('overlay')} onClick={() => onClose(id)} />
				<div className={bem.e('box')}>
					{this.renderCloseButton()}
					<div className={bem.e('content')}>
						{title && <h3 className={bem.e('content-title')}>{title}</h3>}
						{secondaryLanguageTitle && <h3 className={bem.e('secondary-title')}>{secondaryLanguageTitle}</h3>}
						<div className={bem.e('list')}>
							<CWMenu
								onInfoClick={onInfoClick}
								handleClickInside={handleClickInside}
								onRemoveItemClick={item => this.onRemoveItem(item)}
								item={item}
								index={index}
								railPosition={railPosition}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private onRemoveItem(item) {
		const { onClose, id, onRemoveItemClick } = this.props;
		onClose(id);
		onRemoveItemClick(item);
	}

	private renderCloseButton = () => {
		const { id, onClose } = this.props;
		return (
			<button className={bem.e('close')} onClick={() => onClose(id)}>
				<CloseIcon />
			</button>
		);
	};
}

export default CWBottomPanel;
