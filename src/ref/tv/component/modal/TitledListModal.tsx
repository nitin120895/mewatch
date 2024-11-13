import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { wrapValue, stopMove, transform, focusedClass } from 'ref/tv/util/focusUtil';
import { DropButtonOption } from 'ref/tv/component/DropButton';
import { FormattedMessage } from 'react-intl';
import IntlFormatter from '../IntlFormatter';
import sass from 'ref/tv/util/sass';
import './TitledListModal.scss';

const bem = new Bem('titled-list');

interface TitledListModalProps extends React.HTMLProps<any> {
	isVisible?: boolean;
	title?: string;
	selectedKey?: string;
	entries: DropButtonOption[];
	needLocalization?: boolean;
	onItemClicked?: (index: number) => void;
}

interface TitledListModalState {
	curIndex?: number;
	isVisible?: boolean;
	maxIndex?: number;
	portraitPosition?: string;
}

export default class TitledListModal extends React.Component<TitledListModalProps, TitledListModalState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;
	private itemsRef;

	static defaultProps = {
		isVisible: false
	};

	constructor(props: TitledListModalProps) {
		super(props);

		const curIndex = props.selectedKey && props.entries.findIndex(e => e.key === props.selectedKey);

		this.state = {
			curIndex: curIndex !== -1 && curIndex !== undefined ? curIndex : 0,
			isVisible: false,
			maxIndex: props.entries.length - 1,
			portraitPosition: '0%'
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentDidMount() {
		const portraitPosition = this.calcPortraitPosition(this.state.curIndex);
		this.setState({ portraitPosition });
	}

	componentWillReceiveProps(nextProps: TitledListModalProps) {
		if (nextProps.isVisible !== undefined && this.state.isVisible !== nextProps.isVisible) {
			this.setState({ isVisible: nextProps.isVisible });

			if (nextProps.isVisible) {
				this.context.focusNav.setFocus(this.focusableRow);
			} else {
				this.context.focusNav.resetFocus();
			}
		}
		if (nextProps.entries) this.setState({ maxIndex: nextProps.entries.length - 1 });
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveUp = (): boolean => {
		const curIndex = wrapValue(this.state.curIndex - 1, 0, this.state.maxIndex);
		const portraitPosition = this.calcPortraitPosition(curIndex);
		this.setState({ curIndex, portraitPosition });

		return true;
	};

	private moveDown = (): boolean => {
		const curIndex = wrapValue(this.state.curIndex + 1, 0, this.state.maxIndex);
		const portraitPosition = this.calcPortraitPosition(curIndex);
		this.setState({ curIndex, portraitPosition });

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				const { onItemClicked } = this.props;
				const { curIndex } = this.state;
				if (onItemClicked) onItemClicked(curIndex);
				return true;
			default:
				break;
		}

		return false;
	};

	private onItemsRef = ref => {
		this.itemsRef = ref;
	};

	private calcPortraitPosition = (curIndex: number): string => {
		const { entries } = this.props;
		let portraitPosition = '0%';
		const entriesPerPage = 6;
		const totalEntries = entries.length;
		const totalPages = Math.ceil(totalEntries / entriesPerPage);
		const currentPage = Math.floor(curIndex / entriesPerPage);

		if (currentPage > 0) {
			if (currentPage < totalPages - 1) {
				portraitPosition = -100 * currentPage + '%';
			} else {
				if (this.itemsRef) {
					portraitPosition =
						(-(this.itemsRef.scrollHeight - this.itemsRef.clientHeight) / this.itemsRef.clientHeight) * 100 + '%';
				}
			}
		}

		return portraitPosition;
	};

	render() {
		const { title, entries, onItemClicked, needLocalization } = this.props;
		const { curIndex, portraitPosition } = this.state;
		const styleTransform = transform(`-50%, ${portraitPosition}`, sass.transitionDuration, 0, false);
		const sortFilterItems = {
			styleTransform,
			entries,
			curIndex,
			onItemClicked,
			needLocalization
		};

		return (
			<div className={bem.b()}>
				<div className={bem.e('titleDiv')}>
					<IntlFormatter tagName="div" className={bem.e('title')}>
						{title}
					</IntlFormatter>
				</div>

				{this.renderSortFilterDialog(sortFilterItems)}

				<div className={bem.e('cover')} />
			</div>
		);
	}

	private renderSortFilterDialog(sortFilterItems) {
		const { styleTransform, entries, curIndex, onItemClicked, needLocalization } = sortFilterItems;

		if (needLocalization) {
			return (
				<div className={bem.e('items')} style={styleTransform} ref={this.onItemsRef}>
					{entries &&
						entries.map((item, i) => {
							return (
								<FormattedMessage id={item.label} key={`item-${i}`}>
									{value => (
										<div
											className={cx(bem.e('item'), curIndex === i ? focusedClass : '')}
											onMouseEnter={() => {
												this.setState({
													curIndex: i
												});
											}}
											onClick={() => {
												onItemClicked(i);
											}}
										>
											{value}
										</div>
									)}
								</FormattedMessage>
							);
						})}
				</div>
			);
		} else {
			return (
				<div className={bem.e('items')} style={styleTransform} ref={this.onItemsRef}>
					{entries &&
						entries.map((item, i) => {
							return (
								<div
									key={`item-${i}`}
									className={cx(bem.e('item'), curIndex === i ? focusedClass : '')}
									onMouseEnter={() => {
										this.setState({
											curIndex: i
										});
									}}
									onClick={() => {
										onItemClicked(i);
									}}
								>
									{item.label}
								</div>
							);
						})}
				</div>
			);
		}
	}
}
