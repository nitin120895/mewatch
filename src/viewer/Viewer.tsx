import * as React from 'react';
import Header from './ui/Header';
import Frame from './Frame';
import SideNavigation from './ui/SideNavigation';
import ViewportMetadata from './ui/ViewportMetadata';
import { getCurrentPath, hasPathChanged } from './util/hashbang';
import { Helmet } from 'react-helmet';

interface ViewerState {
	// The width & height are used ahead of time to size the viewport on intial load.
	width: string;
	height: string;
	// The viewport dimensions are the rendered width & height after the initial load.
	// These are in sync with the above properties after the initial load has occured.
	viewport: viewport.Dimensions;
	path: string;
	breakpoint: viewport.DeviceType;
	menuOpen: boolean;
	activePagePath: string;
	activePageTitle?: string;
}

export default class Viewer extends React.Component<any, any> {
	private container;
	private resizeDelay: any;

	constructor(props) {
		super(props);
		this.state = this.getDefaultState(props);
	}
	componentDidMount() {
		window.addEventListener('hashchange', this.onHashChange);
		window.addEventListener('resize', this.onWindowResize);
		this.onWindowResize(undefined);
	}
	componentWillUnmount() {
		window.removeEventListener('hashchange', this.onHashChange);
		window.removeEventListener('resize', this.onWindowResize);
		this.setState({ height: '100%' });
	}

	getDefaultState = (props): ViewerState => {
		const path = window.location.hash;
		return {
			path: path,
			width: undefined,
			height: undefined,
			breakpoint: 'unconstrained',
			viewport: { width: 0, height: 0 },
			menuOpen: false,
			activePagePath: getCurrentPath(path),
			activePageTitle: ''
		};
	};

	onWindowResize = e => {
		// Rate limit the event.
		if (this.resizeDelay) clearTimeout(this.resizeDelay);
		this.resizeDelay = setTimeout(this.updateViewportHeight, 200);
	};

	toggleMenu = () => {
		this.setState({ menuOpen: !this.state.menuOpen });
	};

	updateViewportWidth = newWidth => {
		this.setState({ width: newWidth });
	};

	updateViewportHeight = () => {
		// Magic numbers to adjust for the margin above/below as well as well as the toolbar.
		const offset = 40 + 24;
		const height = this.container.parentElement.clientHeight - offset;
		this.setState({ height });
	};

	changeBreakpoint = (breakpoint, minWidth) => {
		let width: number = typeof minWidth === 'string' ? Number(minWidth) : minWidth;
		/* tslint:disable:no-null-keyword */
		if (isNaN(width)) width = null;
		// Resize to match the new breakpoint.
		this.setState({ breakpoint, width });
	};

	// This will trigger when the user navigates between child pages, or
	// when manually changing the path within the browser's address bar.
	onHashChange = e => {
		const newPath = getCurrentPath(e.newURL);
		const state: any = { menuOpen: false };
		if (hasPathChanged(this.state.activePagePath, newPath)) {
			state.activePagePath = newPath;
		}
		this.setState(state);
	};

	// This will trigger when the user navigates between child pages.
	onPathChange = path => {
		// Mimick path changes from the iframe to the parent window to maintain deep linking.
		window.location.hash = path;
		this.setState({ menuOpen: false, activePagePath: path });
	};

	onTitleChange = title => {
		this.setState({ activePageTitle: title });
	};

	onViewportResize = (width, height) => {
		this.setState({ viewport: { width, height } });
	};

	onReference = div => {
		this.container = div;
	};

	render() {
		const { width, height, breakpoint, viewport, menuOpen, activePagePath, activePageTitle } = this.state;
		return (
			<div className="app">
				<Helmet titleTemplate={`Component Library - %s`} title={activePageTitle} />
				<Header
					onOpenMenu={this.toggleMenu}
					onSelectBreakpoint={this.changeBreakpoint}
					breakpoint={breakpoint}
					onSliderChange={this.updateViewportWidth}
					viewportWidth={width}
				/>
				<div className="sandbox">
					<SideNavigation visible={menuOpen} onDismiss={this.toggleMenu} activePagePath={activePagePath} />
					<ViewportMetadata
						className="viewport viewport__header"
						width={width}
						dimensions={viewport}
						activeBreakpoint={breakpoint}
					/>
					<div className="viewport viewport__window" style={{ width, height }} ref={this.onReference}>
						<Frame
							path={activePagePath}
							onPathChange={this.onPathChange}
							onTitleChange={this.onTitleChange}
							onResize={this.onViewportResize}
						/>
					</div>
				</div>
			</div>
		);
	}
}
