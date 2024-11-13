import * as React from 'react';
import Overlay from 'ref/responsive/component/Overlay';
import CollapsibleContainer from 'ref/responsive/component/CollapsibleContainer';
import CollapsibleText from 'ref/responsive/component/CollapsibleText';
import { Bem } from 'shared/util/styles';
import ModalManager from 'ref/responsive/app/modal/ModalManager';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { connect } from 'react-redux';

import './OverlayComponents.scss';

const mockText = require('./text.json').text as string;
const bem = new Bem('overlay-view');

interface OverlayComponentsProps {
	onShowModal: (config: ModalConfig) => void;
}

interface OverlayComponentsState {
	openedGeneral: boolean;
	openedPersistent: boolean;
}

class OverlayComponents extends React.Component<OverlayComponentsProps, OverlayComponentsState> {
	state: OverlayComponentsState = {
		openedGeneral: false,
		openedPersistent: false
	};

	private onToggleDialog = () => {
		this.props.onShowModal({
			id: 'dialog',
			type: ModalTypes.STANDARD_DIALOG,
			componentProps: {
				children: this.renderContent(
					'This is a dialog modal that is styled to be centered on page.<br/>Supports accessibility.<br/>Try keyboard tab focus on buttons and enable screen reader for checking labels.'
				)
			}
		});
	};

	private onToggleScrollable = () => {
		this.props.onShowModal({
			id: 'nested',
			type: ModalTypes.STANDARD_DIALOG,
			componentProps: {
				children: <NestedScrollableModalBody />
			}
		});
	};

	private onToggleGeneral = () => {
		this.setState({ openedGeneral: !this.state.openedGeneral });
	};

	private onTogglePersistent = () => {
		this.setState({ openedPersistent: !this.state.openedPersistent });
	};

	render() {
		return (
			<div className={bem.b()}>
				<ModalManager />
				<div className={bem.e('button')}>
					<button onClick={this.onToggleDialog}>Open Dialog Modal</button>
				</div>
				<div className={bem.e('button')}>
					<button onClick={this.onToggleScrollable}>Open Scrollable Modal</button>
				</div>
				<div className={bem.e('button')}>
					<button onClick={this.onToggleGeneral}>Open General Overlay</button>
					{this.renderGeneralOverlay()}
				</div>
				<div className={bem.e('button')}>
					<button onClick={this.onTogglePersistent}>Open Persistent Overlay</button>
					{this.renderPersistentOverlay()}
				</div>
				<br />
				<hr />
				<h4>Collapsible Containers & Text</h4>
				<br />
				<CollapsibleContainer className={bem.e('collapse-2-lines')} renderExpanded={this.renderExpandedModalContent}>
					<p>
						You can click this to open a modal with the complete lorem ipsum text:
						<br />
						{mockText}
					</p>
				</CollapsibleContainer>
				<br />
				<hr />
				<CollapsibleContainer className={bem.e('collapse-2-lines')}>
					<p>
						This container has a max height set via css, restricting it to a maxiumum of 2 lines. Depending on window
						width, the text in the container will sometimes exceed the maximum number of lines. Overflow will be hidden
						with a fade to black overlay applied. You can click to expand and reveal the full text after which it will
						remain expanded.
					</p>
				</CollapsibleContainer>
				<br />
				<hr />
				<CollapsibleContainer maxHeight="66px">
					<p>This container has a max height set through props. Click to expand and reveal the full content.</p>
					<div className={bem.e('collapse-box')} />
				</CollapsibleContainer>
				<br />
				<hr />
				<CollapsibleText maxLines={4}>
					<p>
						This is using the CollapsibleText component to truncate the lines to a max of 4. You can click this to
						expand the complete lorem ipsum text:
						<br />
						{mockText}
					</p>
				</CollapsibleText>
			</div>
		);
	}

	private renderGeneralOverlay() {
		if (!this.state.openedGeneral) return;
		return (
			<Overlay groupClassName={bem.e('modal')} onDismiss={this.onToggleGeneral}>
				{this.renderContent('This is an overlay which can be positioned anywhere.')}
			</Overlay>
		);
	}

	private renderPersistentOverlay() {
		const opened = this.state.openedPersistent;
		return (
			<Overlay groupClassName={bem.e('modal', { hidden: !opened })} opened={opened} onDismiss={this.onTogglePersistent}>
				{this.renderContent('This is a persistent overlay which is toggled via the `opened` prop.')}
			</Overlay>
		);
	}

	private renderContent(__html: string) {
		return [
			<div key="header" className={bem.e('header')}>
				<button className={bem.e('btn')}>First Button</button>
				<button className={bem.e('btn')}>Second Button</button>
				<button className={bem.e('btn')}>Third Button</button>
			</div>,
			<p key="body" className={bem.e('body')} dangerouslySetInnerHTML={{ __html }} />
		];
	}

	private renderExpandedModalContent = () => {
		return <p className={bem.e('body', 'scrollable')}>{mockText}</p>;
	};
}

class NestedScrollableModalBody extends React.Component<any, any> {
	render() {
		return (
			<div>
				<p className={bem.e('header')}>There are two nested scrollable containers in here</p>
				<p ref={this.props.onScrollableChildRef} className={bem.e('body', 'scrollable')}>
					{mockText}
				</p>
				<p ref={this.props.onScrollableChildRef} className={bem.e('body', 'scrollable')}>
					{mockText}
				</p>
			</div>
		);
	}
}

const actions = {
	onShowModal: OpenModal
};

export default connect<any, any, OverlayComponentsProps>(
	undefined,
	actions
)(OverlayComponents);
