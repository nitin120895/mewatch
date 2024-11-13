import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import SupportModal, { SupportModalOwnProps } from './SupportModal';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { getPage } from 'shared/service/app';
import { getPathByKey } from 'shared/page/sitemapLookup';
import { registerFormBem } from './CreateAccountForm';
import { SUPPORT_MODAL_ID } from 'toggle/responsive/util/authUtil';

interface OwnProps {
	pageKey: string;
	label: string;
}

interface StateProps {
	config?: state.Config;
}

interface DispatchProps {
	showModal?: (modal: ModalConfig) => void;
	showSupportModal?: (modal: ModalConfig) => void;
}

type Props = OwnProps & DispatchProps & StateProps;

interface State {
	isLink: boolean;
	page: api.Page | undefined;
}

class Policy extends React.Component<Props, State> {
	state = {
		isLink: false,
		page: undefined
	};

	componentDidMount() {
		const { pageKey, config } = this.props;
		getPage(getPathByKey(pageKey, config), { textEntryFormat: 'html' }).then(result => {
			const entries = result.data.entries;
			this.setState({ page: result.data });
			if (entries && entries.length > 0 && entries[0].template === 'X3') {
				this.setState({ isLink: true });
			}
		});
	}
	private toggleOverlay = event => {
		// Prevents labels from changing checkbox state
		event.preventDefault();
		const { page } = this.state;
		const { pageKey } = this.props;

		const props: SupportModalOwnProps = {
			id: SUPPORT_MODAL_ID,
			pageKey,
			page
		};

		this.props.showSupportModal({
			id: SUPPORT_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <SupportModal {...props} />
		});
	};

	renderSupportModal() {
		const { label } = this.props;
		return (
			<IntlFormatter tagName="span" className={registerFormBem.e('policy-link')} onClick={this.toggleOverlay}>
				{label}
			</IntlFormatter>
		);
	}

	renderLink() {
		const { label } = this.props;
		const { page } = this.state;
		const externalUrl = page.entries.length > 0 ? page.entries[0].customFields.link : '#';

		return (
			<IntlFormatter tagName="a" href={externalUrl} target="__blank" className={registerFormBem.e('policy-link')}>
				{label}
			</IntlFormatter>
		);
	}

	render() {
		const { isLink } = this.state;
		return isLink ? this.renderLink() : this.renderSupportModal();
	}
}

function mapStateToProps({ app }: state.Root) {
	return { config: app.config };
}

function mapDispatchToProps(dispatch) {
	return {
		showModal: (modal: ModalConfig) => dispatch(OpenModal(modal)),
		showSupportModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

export default connect<any, any, Props>(
	mapStateToProps,
	mapDispatchToProps
)(Policy);
