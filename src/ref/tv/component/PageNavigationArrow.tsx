import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import KeysModel from 'shared/util/platforms/keysModel';
import { DirectionalNavigation, GlobalEvent } from 'ref/tv/DirectionalNavigation';
import { PageNavigationArrow } from '../util/PageNavigationArrow';
import './PageNavigationArrow.scss';

const bem = new Bem('page-navigation-arrow');
const id = 'pageNavigationArrow';

interface PageNavigationArrowState {
	isShow: boolean;
	showUpArrow: boolean;
	showDownArrow: boolean;
}

export default class PageNavigationArrowComponent extends React.Component<any, PageNavigationArrowState> {
	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	context: {
		focusNav: DirectionalNavigation;
	};

	constructor(props) {
		super(props);

		this.state = {
			isShow: false,
			showUpArrow: false,
			showDownArrow: false
		};

		PageNavigationArrow.setup(this);
	}

	componentWillUnmount() {
		this.context.focusNav.removeEventHandler(GlobalEvent.MOUSE_ACTIVE, id);
	}

	componentDidMount() {
		this.context.focusNav.addEventHandler(GlobalEvent.MOUSE_ACTIVE, id, () => {
			this.checkArrowDisplay();
		});

		this.checkArrowDisplay();
	}

	shouldComponentUpdate(nextProps, nextState: PageNavigationArrowState) {
		const { isShow, showUpArrow, showDownArrow } = this.state;

		if (
			isShow === nextState.isShow &&
			showUpArrow === nextState.showUpArrow &&
			showDownArrow === nextState.showDownArrow
		) {
			return false;
		}

		return true;
	}

	private checkArrowDisplay = () => {
		this.setState({ isShow: this.context.focusNav.mouseActive });
		this.context.focusNav.displayPageArrow();
	};

	private onClickPageNavigationArrow = (e, position) => {
		e.preventDefault();

		let direction = 0;

		if (position === 'top') {
			direction = KeysModel.Up;
		} else if (position === 'bottom') {
			direction = KeysModel.Down;
		}

		this.context.focusNav.move(direction);
	};

	show = (position?: string) => {
		const { isShow } = this.state;

		if (isShow) {
			switch (position) {
				case 'top':
					this.setState({ showUpArrow: true });
					break;
				case 'bottom':
					this.setState({ showDownArrow: true });
					break;
				default:
					this.setState({ showUpArrow: true, showDownArrow: true });
					break;
			}
		} else {
			this.setState({ showUpArrow: false, showDownArrow: false });
		}
	};

	hide = (position?: string) => {
		const { isShow } = this.state;

		if (isShow) {
			switch (position) {
				case 'top':
					this.setState({ showUpArrow: false });
					break;
				case 'bottom':
					this.setState({ showDownArrow: false });
					break;
				default:
					this.setState({ showUpArrow: false, showDownArrow: false });
					break;
			}
		} else {
			this.setState({ showUpArrow: false, showDownArrow: false });
		}
	};

	render() {
		const { isShow, showUpArrow, showDownArrow } = this.state;

		return (
			<div>
				<div
					className={cx(bem.b(isShow && showUpArrow ? 'show' : ''), bem.e('top'))}
					onClick={e => {
						this.onClickPageNavigationArrow(e, 'top');
					}}
				>
					<button type="button" className={bem.e('btn')}>
						<i className={cx('icon', 'icon-up-arrow-btn', bem.e('icon'))} />
					</button>
				</div>
				<div
					className={cx(bem.b(isShow && showDownArrow ? 'show' : ''), bem.e('bottom'))}
					onClick={e => {
						this.onClickPageNavigationArrow(e, 'bottom');
					}}
				>
					<button type="button" className={bem.e('btn')}>
						<i className={cx('icon', 'icon-down-arrow-btn', bem.e('icon'))} />
					</button>
				</div>
			</div>
		);
	}
}
