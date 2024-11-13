import * as React from 'react';
import { getCurrentPath, cleanPath, hasPathChanged } from './util/hashbang';
import findRoute from './util/findRoute';
import routes from './ref/routes';

interface FrameProps extends React.HTMLProps<any> {
	path?: string;
	onPathChange(path: string): void;
	onTitleChange(title: string): void;
	onResize(width: number, height: number): void;
}

export default class Frame extends React.Component<FrameProps, any> {
	private iframe;
	private viewport;

	constructor(props) {
		super(props);
		this.state = {
			// We store the path state here to allow maintaining the React Router state history which
			// is stored within the query parameter after the hash value. At runtime the expectation
			// is that this value will be identical to `this.props.path` with an optional appended query.
			path: props.path
		};
	}

	componentDidMount() {
		this.viewport = this.iframe.contentWindow;
		this.viewport.addEventListener('hashchange', this.onHashChange, false);
		this.viewport.addEventListener('resize', this.onResize, false);
		this.iframe = undefined;
	}

	componentWillUnmount() {
		this.viewport.removeEventListener('hashchange', this.onHashChange);
		this.viewport.removeEventListener('resize', this.onResize);
		this.viewport = undefined;
	}

	shouldComponentUpdate(nextProps, nextState) {
		// Check whether the paths differ as to whether or not we need to re-render.
		// Internal page changes will update the query string after the hash value due to React Router's state handling.
		// We don't want to bubble up hash changes when only the query/state changes.
		// External page changes from the parent need to be passed down into the iFrame to ensure React Router handles
		const pathDiffers = hasPathChanged(this.state.path, nextProps.path);
		return pathDiffers;
	}

	componentWillReceiveProps(nextProps) {
		const pathDiffers = hasPathChanged(this.state.path, nextProps.path);
		if (pathDiffers) {
			this.setState({ path: nextProps.path });
		}
	}

	onHashChange = e => {
		// Strip any potential query from the end of the new path
		const cleanedPath = cleanPath(getCurrentPath(e.newURL));
		const hasRoute = !!findRoute(cleanedPath.substr(1), routes);
		// Ignore path changes not within our routes.
		// This is useful for ignoring paths from our main app when testing components which use
		// react-router's Link component.
		if (hasRoute) {
			// Pass the page title to the outer frame
			this.props.onTitleChange(this.viewport.document.title);
			if (hasPathChanged(this.state.path, cleanedPath)) {
				// Pass hash changes from the child iframe up to the parent
				this.props.onPathChange(cleanedPath);
			}
		}
	};

	onResize = e => {
		this.props.onResize(this.viewport.innerWidth, this.viewport.innerHeight);
	};

	onReference = iframe => {
		this.iframe = iframe;
	};

	render() {
		// iFrames supported percentage based dimension attributes within HTML 4.01 however
		// this is no longer the case for HTML 5.
		// To counteract this we're applying percentage based dimensions via CSS instead.
		// It is the responsibility of the parent to provide an explicit height in pixels to
		// ensure it properly fills the binding box.
		return (
			<iframe
				ref={this.onReference}
				src={`components-iframe.html${this.state.path}`}
				className={this.props.className || 'iframe'}
				frameBorder={0}
				allowFullScreen={true}
				name="inner"
			/>
		);
	}
}
