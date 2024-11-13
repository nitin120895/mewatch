import * as React from 'react';
import SidePanelOverlay from 'shared/component/SidePanelOverlay';
import MenuButton from 'ref/responsive/app/header/MenuButton';
import { VerticalNav } from 'ref/responsive/app/nav/VerticalNav';

import './PanelComponents.scss';
const ExampleNavigation = require('./ExampleNavigation.json');

export default class PanelComponents extends React.Component<PageProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			overlayLeftOpen: false,
			overlayRightOpen: false,
			overlayNavOpen: false
		};
	}

	onOpenPanel(key) {
		this.setState({ [key]: true });
	}
	onClosePanel(key) {
		this.setState({ [key]: false });
	}

	render() {
		const { overlayLeftOpen, overlayRightOpen, overlayNavOpen } = this.state;
		return (
			<main className="component">
				<h3>Side Panel Overlay Component</h3>
				<section>
					<p>This panel slides out from the side of the screen and overlays above the rest of the app content.</p>
					<p>Below we provide examples of the panel sliding out from each side of the screen.</p>
					<p>
						<em>To open a panel action one of the below menu buttons.</em>
					</p>
					<p>
						<em>To close a panel click, tap, or swipe within the faded out area above the page content.</em>
					</p>
					<div className="flex-horz-edges">
						<MenuButton
							width="32"
							height="32"
							toggleMenuVisibility={this.onOpenPanel.bind(this, 'overlayLeftOpen')}
							menuVisible={overlayLeftOpen}
						/>
						<SidePanelOverlay
							edge="left"
							visible={overlayLeftOpen}
							onDismiss={this.onClosePanel.bind(this, 'overlayLeftOpen')}
						>
							{this.renderPanelContent(overlayLeftOpen)}
						</SidePanelOverlay>
						<MenuButton
							width="32"
							height="32"
							toggleMenuVisibility={this.onOpenPanel.bind(this, 'overlayRightOpen')}
							menuVisible={overlayRightOpen}
						/>
						<SidePanelOverlay
							edge="right"
							visible={overlayRightOpen}
							onDismiss={this.onClosePanel.bind(this, 'overlayRightOpen')}
						>
							{this.renderPanelContent(overlayRightOpen)}
						</SidePanelOverlay>
					</div>
					<p>
						Click the menu button below to reveal a panel containing the mobile/tablet vertical nav populated with test
						data.
					</p>
					<MenuButton
						width="32"
						height="32"
						toggleMenuVisibility={this.onOpenPanel.bind(this, 'overlayNavOpen')}
						menuVisible={overlayNavOpen}
					/>
					<SidePanelOverlay
						edge="right"
						visible={overlayNavOpen}
						onDismiss={this.onClosePanel.bind(this, 'overlayNavOpen')}
					>
						<VerticalNav navigation={ExampleNavigation} focusable={overlayNavOpen} />
					</SidePanelOverlay>
				</section>
			</main>
		);
	}

	private renderPanelContent(panelOpen: boolean) {
		// To maintain proper accessibility, ensure you disable tab focus on all interactive elements
		// within a SidePanel when it's not visible!
		const tabEnabled = panelOpen ? 0 : -1;
		return (
			<nav>
				<p>Content goes here...</p>
				<a tabIndex={tabEnabled}>Example Link</a>
			</nav>
		);
	}
}
