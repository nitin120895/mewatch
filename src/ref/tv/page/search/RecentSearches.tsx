import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { FormattedMessage } from 'react-intl';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { focusedClass } from 'ref/tv/util/focusUtil';
import { KEY_CODE } from '../../util/keycodes';
import './RecentSearches.scss';

const rowIndex = 3;

interface RecentSearchesProps extends React.Props<any> {
	onSearch: (query: string) => Promise<any>;
	onClearSearches: () => void;
	searches: string[];
	searchPagePath: string;
}

interface TitledListModalState {
	focused?: boolean;
	focusState?: 'list' | 'clearBtn';
	curIndex?: number;
}

const bem = new Bem('recent-searches');

export default class RecentSearches extends React.Component<RecentSearchesProps, TitledListModalState> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref;

	constructor(props) {
		super(props);

		this.state = {
			focused: false,
			focusState: 'list',
			curIndex: 0
		};

		this.focusableRow = {
			focusable: true,
			index: 3,
			height: 1,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.focusableRow.ref = this.ref;
		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
		this.focusableRow.height = this.ref && this.ref.clientHeight;
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			focused: isFocus
		});
		return true;
	};

	private moveLeft = (): boolean => {
		const { focusState } = this.state;

		if (focusState === 'clearBtn') {
			this.setState({
				focusState: 'list'
			});
		}

		return true;
	};

	private moveRight = (): boolean => {
		const { focusState } = this.state;

		if (focusState === 'list') {
			this.setState({
				focusState: 'clearBtn'
			});
		}

		return true;
	};

	private moveUp = (): boolean => {
		const { focusState, curIndex } = this.state;

		if (focusState === 'list' && curIndex > 0) {
			this.setState({
				curIndex: curIndex - 1
			});

			return true;
		}

		return false;
	};

	private moveDown = (): boolean => {
		const { focusState, curIndex } = this.state;
		const { searches } = this.props;

		if (focusState === 'list' && curIndex < searches.length - 1) {
			this.setState({
				curIndex: curIndex + 1
			});

			return true;
		}

		if (focusState === 'clearBtn') {
			this.setState({
				focusState: 'list'
			});

			return true;
		}

		return false;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				const { focusState, curIndex } = this.state;

				if (focusState === 'clearBtn') {
					// focus on the search input
					this.context.focusNav.moveToRow(1);
					this.onClearSearches();
				} else if (focusState === 'list') {
					const item = this.props.searches[curIndex];
					const location = `${this.props.searchPagePath}?q=${encodeURIComponent(item)}`;

					this.context.router.replace(location);
					this.props.onSearch(item);
					this.context.focusNav.moveToRow(1);
				}
				return true;

			case 'esc':
				this.context.focusNav.move(KEY_CODE.UP, true);
				return true;

			default:
				break;
		}

		return false;
	};

	private onClearSearches = () => {
		this.props.onClearSearches();
	};

	private onRef = ref => {
		this.ref = ref;
	};

	private handleMouseEnter = () => {
		!this.context.focusNav.disableMouseFocus && this.context.focusNav.moveToRow(rowIndex);
	};

	private mouseEnterSearchItem = index => {
		this.setState({ focusState: 'list', curIndex: index });
	};

	private clickSearchItem = () => {
		this.exec('click');
	};

	private mouseEnterClearBtn = () => {
		this.setState({ focusState: 'clearBtn' });
	};

	render() {
		const { searches } = this.props;
		const { focused } = this.state;

		return (
			<section className={bem.b({ focused })} ref={this.onRef} onMouseEnter={this.handleMouseEnter}>
				<header className={bem.e('header')}>
					<FormattedMessage id="search_recent_heading">
						{value => <div className={bem.e('heading')}>{value}</div>}
					</FormattedMessage>
				</header>
				<ul className={cx(bem.e('list'))}>{searches.map(this.renderSearchItem)}</ul>

				{this.renderClearButton()}
			</section>
		);
	}

	private renderSearchItem = (item, index) => {
		const { focused, focusState, curIndex } = this.state;
		const location = `${this.props.searchPagePath}?q=${encodeURIComponent(item)}`;

		return (
			<SearchItem
				key={index}
				index={index}
				item={item}
				className={cx(bem.e('item'), focused && focusState === 'list' && curIndex === index ? focusedClass : '')}
				location={location}
				onMouseEnter={this.mouseEnterSearchItem}
				onClick={this.clickSearchItem}
			/>
		);
	};

	private renderClearButton() {
		const { focused, focusState } = this.state;

		return (
			<FormattedMessage id={'search_recent_clear_label_top'}>
				{value => (
					<button
						type="button"
						onMouseEnter={this.mouseEnterClearBtn}
						onClick={this.onClearSearches}
						className={cx(bem.e('clear'), 'brand__btn', focused && focusState === 'clearBtn' ? focusedClass : '')}
					>
						{value}
					</button>
				)}
			</FormattedMessage>
		);
	}
}

interface SearchItemProps extends React.HTMLProps<any> {
	index: number;
	item: string;
	className: string;
	location: string;
	onMouseEnter?: (index) => void;
	onClick?: () => void;
}

class SearchItem extends React.Component<SearchItemProps, any> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	private handleMouseClick = () => {
		this.props.onClick && this.props.onClick();
	};

	render(): any {
		const { className, item, location } = this.props;

		return (
			<li className={className} onMouseEnter={this.handleMouseEnter} onClick={this.handleMouseClick}>
				<Link to={location} className={bem.e('link')}>
					{item}
				</Link>
			</li>
		);
	}
}
