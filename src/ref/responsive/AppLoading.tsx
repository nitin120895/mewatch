import * as React from 'react';
import { connect } from 'react-redux';
import AppProgress from './app/loading/AppProgress';

interface AppLoadingProps {
	loading?: boolean;
}

class AppLoading extends React.Component<AppLoadingProps, any> {
	timeoutId: number;

	private checkLoading(loading?: boolean, wasLoading?: boolean) {
		if (loading !== undefined && loading !== wasLoading) {
			window.clearTimeout(this.timeoutId);
			if (loading) {
				this.timeoutId = window.setTimeout(() => AppProgress.start(), 500);
			} else {
				AppProgress.done(true);
				/**
				 * For legacy browsers which don't support the picture element we need to reinitialise the polyfill to ensure it
				 * loads the correct image source for the window's active breakpoint. Failure to do this causes the default (mobile)
				 * image to display which may mismatch the active breakpoint.
				 * This is necessary under a SSR scenario where the polyfill activation is skipped during server-side rendering
				 * because Slingshot doesn't have access to the `window` object during the original initialisation.
				 */
				window.requestAnimationFrame(window.picturefill);
			}
		}
	}

	componentWillUnmount() {
		window.clearTimeout(this.timeoutId);
	}

	componentWillReceiveProps(nextProps: AppLoadingProps) {
		this.checkLoading(nextProps.loading, this.props.loading);
	}

	render() {
		// tslint:disable-next-line
		return null;
	}
}

function mapStateToProps(state: state.Root) {
	return {
		loading: state.app.chunkLoading || state.page.loading
	};
}

export default connect<any, any, AppLoadingProps>(mapStateToProps)(AppLoading);
