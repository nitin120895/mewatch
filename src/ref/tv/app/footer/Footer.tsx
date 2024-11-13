import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import CtaButton from '../../component/CtaButton';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import sass from 'ref/tv/util/sass';
import './Footer.scss';

const bem = new Bem('footer');
const id = 'footer';

export interface FooterState {
	isFocused: boolean;
	hide: boolean;
}
type FooterProps = Partial<{
	pageLoading: boolean;
}>;

class Footer extends React.Component<FooterProps, FooterState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLDivElement;
	private updateTimer: number;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false,
			hide: true
		};

		this.focusableRow = {
			focusable: false,
			index: 99999,
			height: sass.footerHeight,
			restoreSavedState: this.restoreSavedState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: stopMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		const { focusNav } = this.context;

		focusNav.addEventHandler(GlobalEvent.PAGE_CHANGED, id, () => {
			this.setTimer();
		});

		focusNav.addEventHandler(GlobalEvent.RESIZED, id, () => {
			this.setTimer();
		});

		this.focusableRow.ref = this.ref;
	}

	componentWillReceiveProps(nextProps: FooterProps) {
		if (nextProps.pageLoading !== this.props.pageLoading) {
			this.setTimer();
		}
	}

	componentWillUnmount() {
		clearImmediate(this.updateTimer);

		const { focusNav } = this.context;
		focusNav.unregisterRow(this.focusableRow);

		focusNav.removeEventHandler(GlobalEvent.PAGE_CHANGED, id);
		focusNav.removeEventHandler(GlobalEvent.RESIZED, id);
	}

	private setTimer() {
		clearImmediate(this.updateTimer);
		this.updateTimer = setImmediate(this.displayBtn);
	}

	private displayBtn = () => {
		clearImmediate(this.updateTimer);

		const { focusNav } = this.context;
		const offsetTop = focusNav.calcOffsetTop(this.focusableRow.index);
		const hideFooter = offsetTop < sass.viewportHeight;

		if (hideFooter && this.ref) {
			this.setState({ hide: true });
			this.focusableRow.focusable = false;
			focusNav.unregisterRow(this.focusableRow);
		} else {
			this.ref && this.setState({ hide: false });
			this.focusableRow.focusable = true;
			focusNav.registerRow(this.focusableRow);
		}
	};

	private restoreSavedState = (savedState: object) => {
		const state = savedState as FooterState;
		if (state) {
			this.setState({
				isFocused: state.isFocused
			});
		}
	};

	private setFocus = (isFocus?: boolean): boolean => {
		if (this.ref) this.setState({ isFocused: isFocus });
		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.context.focusNav.moveToTop();
				return true;
			default:
				break;
		}

		return false;
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	render(): any {
		return (
			<div className={bem.b({ hide: this.props.pageLoading || this.state.hide })} ref={this.onRef}>
				<CtaButton
					className={bem.e('back-to-top', { focused: this.state.isFocused })}
					label={'@{nav_footer_backToTop_label}'}
					onClick={this.handleMouseClick}
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
				/>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): FooterProps {
	return {
		pageLoading: state.app.chunkLoading || state.page.loading
	};
}

export default connect<FooterProps, any, FooterProps>(
	mapStateToProps,
	{}
)(Footer);
