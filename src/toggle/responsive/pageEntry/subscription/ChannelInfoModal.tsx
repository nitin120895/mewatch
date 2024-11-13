import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { connect } from 'react-redux';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';
import CloseIcon from '../../component/modal/CloseIcon';
import { resolveImage } from 'shared/util/images';
import Link from 'shared/component/Link';

import './ChannelInfoModal.scss';

const bem = new Bem('channel-info-modal');

export interface ChannelInfoModalOwnProps {
	id: string;
	onCancel: () => void;
	item?: api.ItemSummary;
	images?: { [key: string]: string };
}

type ChannelInfoModalProps = ChannelInfoModalOwnProps & ModalManagerDispatchProps;

class ChannelInfoModal extends React.PureComponent<ChannelInfoModalProps, any> {
	private onCancel = () => {
		const { onCancel, closeModal, id } = this.props;
		onCancel();
		closeModal(id);
	};

	private onClick = e => {
		e.stopPropagation();
	};

	render() {
		const {
			item: { images, title, customFields, path }
		} = this.props;
		const image = resolveImage(images, ['wallpaper', 'tile', 'custom'], { width: 355 });
		const windowText = customFields && customFields['modal-window-text'];
		const urlText = customFields && customFields['modal-window-URL-text'];

		return (
			<div className="channel-info-overlay" onClick={this.onCancel}>
				<div className={bem.b()} onClick={this.onClick}>
					<div className={bem.e('close')} onClick={this.onCancel}>
						<CloseIcon />
					</div>
					<div className={bem.e('container')}>
						<div className={bem.e('img')}>
							<img src={image.src} />
						</div>
						<div className={bem.e('content')}>
							<div className={bem.e('title')}>{title}</div>
							{windowText && <div className={bem.e('text')}>{windowText}</div>}
							{path && urlText && (
								<Link to={path} className={bem.e('link')}>
									{urlText}
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}

export default connect<any, ModalManagerDispatchProps, ChannelInfoModalOwnProps>(
	undefined,
	mapDispatchToProps
)(ChannelInfoModal);
