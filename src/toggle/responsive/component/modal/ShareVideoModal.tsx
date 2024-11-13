import * as React from 'react';
import { connect } from 'react-redux';
import { Embed as embedPageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { Bem } from 'shared/util/styles';

import Dialog from 'ref/responsive/component/dialog/Dialog';
import DialogTitle from 'ref/responsive/component/dialog/DialogTitle';
import CopyInput from 'toggle/responsive/component/input/CopyInput';
import EmbedCodeGenerator from 'toggle/responsive/component/EmbedCodeGenerator';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { getItemFullPath } from 'shared/util/itemUtils';

import './ShareVideoModal.scss';

const bem = new Bem('share-video-modal');
const TOAST_SHOW_TIME = 3000;

interface ShareVideoModalStateProps {
	config: state.Config;
}

export interface ShareVideoModalOwnProps {
	id?: string;
	item: api.ItemSummary;
	title?: string;
	allowEmbed?: boolean;
	onClose?: () => void;
	onShare?: () => void;
}

type ShareVideoModalProps = ShareVideoModalStateProps & ShareVideoModalOwnProps;

export interface ShareVideoModalState {
	shouldShowToast?: boolean;
}

class ShareVideoModal extends React.PureComponent<ShareVideoModalProps, ShareVideoModalState> {
	static defaultProps = {
		allowEmbed: false
	};
	state = { shouldShowToast: false };

	private toastShowTimeout: number;

	componentWillUnmount() {
		window.clearInterval(this.toastShowTimeout);
	}

	private renderSocialShare = () => {
		const { item } = this.props;
		const path = getItemFullPath(item);
		return (
			<div className={bem.e('social')}>
				{/* <IntlFormatter elementType="p" className={bem.e('share-title')}>
					{'@{share_modal_share_label|Share to}'}
				</IntlFormatter> */}

				<CopyInput
					id="copyLinkInput"
					name="copyLinkInput"
					label={'@{share_modal_link_label|Link}'}
					value={path}
					onCopied={this.onCopied}
				/>
			</div>
		);
	};

	private getEmbedPath() {
		const { config, item } = this.props;
		let path = getPathByKey(embedPageKey, config);
		if (!path) return;

		path = path.replace(':id', item.id);

		return `${window.location.origin}${path}`;
	}

	private renderEmbedCode = () => {
		const embedPath = this.getEmbedPath();
		if (!embedPath) return;

		return (
			<div className={bem.e('embed')}>
				<hr className={bem.e('divider')} />
				<EmbedCodeGenerator onCopied={this.onCopied} embedPath={embedPath} />
			</div>
		);
	};

	private renderToast = () => {
		return (
			<IntlFormatter elementType="div" className={bem.e('toast')}>
				{'@{copy_to_clipboard_msg|Copy to clipboard}'}
			</IntlFormatter>
		);
	};

	onCopied = () => {
		this.setState({ shouldShowToast: true });
		this.toastShowTimeout = window.setTimeout(() => {
			this.setState({ shouldShowToast: false });
		}, TOAST_SHOW_TIME);
	};

	render() {
		const { title, allowEmbed, onClose } = this.props;
		const { shouldShowToast } = this.state;
		return (
			<Dialog onClose={onClose} className={bem.b()}>
				{shouldShowToast && this.renderToast()}

				{title && <DialogTitle>{title}</DialogTitle>}
				<div className={bem.e('content')}>
					{this.renderSocialShare()}
					{allowEmbed && this.renderEmbedCode()}
				</div>
			</Dialog>
		);
	}
}

function mapStateToProps(state: state.Root) {
	return {
		config: state.app.config
	};
}

export default connect<ShareVideoModalStateProps, {}, ShareVideoModalOwnProps>(
	mapStateToProps,
	undefined
)(ShareVideoModal);
