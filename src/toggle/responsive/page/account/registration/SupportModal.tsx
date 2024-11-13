import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Bem } from 'shared/util/styles';
import CloseIcon from '../../../component/modal/CloseIcon';
import Spinner from 'ref/responsive/component/Spinner';
import H11PageTitle from 'ref/responsive/pageEntry/hero/h11/H11PageTitle';
import H10Text from 'ref/responsive/pageEntry/hero/h10/H10Text';
import Xh1WebView from 'ref/responsive/pageEntry/custom/Xh1WebView';
import Ed3SupportText from 'ref/responsive/pageEntry/editorial/Ed3SupportText';
import { CloseModal } from 'shared/uiLayer/uiLayerWorkflow';
import { ModalManagerDispatchProps } from 'ref/responsive/app/modal/ModalManager';

import './SupportModal.scss';

const bem = new Bem('support-modal');

export interface SupportModalOwnProps {
	pageKey: string;
	page?: api.Page | undefined;
	id: string;
}

type SupportModalProps = SupportModalOwnProps & ModalManagerDispatchProps & DispatchProp<any>;

interface SupportModalState {
	page: api.Page | undefined;
}

class SupportModal extends React.Component<SupportModalProps, SupportModalState> {
	componentWillMount() {
		history.pushState(undefined, undefined, location.href);
		window.addEventListener('popstate', this.preventBackNavigation);
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.preventBackNavigation);
	}

	private preventBackNavigation = () => {
		const { closeModal, id } = this.props;
		window.onpopstate = undefined;
		closeModal(id);
	};

	close = () => {
		const { closeModal, id } = this.props;
		history.back();
		closeModal(id);
	};

	render() {
		const { page } = this.props;

		return (
			<div className={bem.b()}>
				<div className={bem.e('modal')}>
					<div className={bem.e('close')} onClick={this.close}>
						<CloseIcon />
					</div>

					<div className={bem.e('entries')}>
						{page ? page.entries.map(this.renderEntry) : <Spinner className={bem.e('spinner')} />}
					</div>
				</div>
			</div>
		);
	}

	private renderEntry(entry: any) {
		switch (entry.template) {
			case 'H11':
				return <H11PageTitle key={entry.id} {...entry} />;
			case 'H10':
				return <H10Text key={entry.id} {...entry} />;
			case 'XH1':
				return <Xh1WebView key={entry.id} {...entry} />;
			case 'ED3':
				if (!entry.customFields) entry.customFields = {};
				return <Ed3SupportText key={entry.id} {...entry} />;
			default:
				return undefined;
		}
	}
}

function mapDispatchToProps(dispatch) {
	return {
		closeModal: (id: string) => dispatch(CloseModal(id))
	};
}
export default connect<any, ModalManagerDispatchProps, SupportModalOwnProps>(
	undefined,
	mapDispatchToProps,
	undefined,
	{
		withRef: true
	}
)(SupportModal);
