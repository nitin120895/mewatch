/**
 * This file (and it's companion styles) should NOT be included within production builds!
 *
 * To achieve this we need to conditionally reference it based on environment variables. e.g.
 *
 * ```
 * // ES6 Modules don't allow conditional imports so we use CommonJS require instead.
 * const DebugGrid = (_DEV_ || _QA_) ? require('./DebugGrid').default : undefined;
 * ```
 *
 * ```
 * render() {
 * 	return <div>{DebugGrid ? <DebugGrid /> : undefined}</div>;
 * }
 * ```
 */

import * as React from 'react';
import { getQueryParams } from '../../shared/util/urls';
import { NUM_COLUMNS } from './util/grid';
import * as cx from 'classnames';
import { connect } from 'react-redux';

import './DebugGrid.scss';

const G_KEY_CODE = 71;

interface DebugGridProps {
	enabled?: boolean;
}

/**
 * Debug Grid
 *
 * Displays an overlay above the app content to visualise the grid columns
 * to aid in debugging layout issues.
 *
 * Also displays the current breakpoint label in the top right corner.
 *
 * By default this presentation is hidden. You can toggle its visibility
 * via the SHIFT + G keyboard combination.
 *
 * Alternatively for handheld touch screen devices you can enable the
 * visibility via the query string `?grid=true`.
 */
class DebugGrid extends React.PureComponent<DebugGridProps, any> {
	static defaultProps = {
		enabled: true
	};

	constructor() {
		super();
		this.state = { visible: false };
	}

	componentDidMount() {
		window.addEventListener('keyup', this.onKeyUp, false);
		const query = getQueryParams();
		if (query && query.grid) this.toggleGrid();
	}
	componentWillUnmount() {
		window.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyUp = (e: KeyboardEvent) => {
		if (e.shiftKey && e.keyCode === G_KEY_CODE) this.toggleGrid();
	};

	private toggleGrid = () => {
		this.setState({ visible: !this.state.visible });
	};

	render() {
		if (!this.props.enabled) return false;

		const arr = '_'.repeat(NUM_COLUMNS).split('');
		const classes = cx('grid-expose', 'baseline-expose', {
			hidden: !this.state.visible
		});
		return <div className={classes}>{arr.map((char, i) => this.renderColumn(i))}</div>;
	}

	private renderColumn(i: number) {
		return (
			<div className="col col-phone-1" key={`grid-expose-${i}`}>
				<div className="col-child" />
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		enabled: state.app.clientSide
	};
}

export default connect<DebugGridProps, any, any>(mapStateToProps)(DebugGrid);
