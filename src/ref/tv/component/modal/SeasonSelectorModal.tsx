import * as React from 'react';
import * as PropTypes from 'prop-types';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, wrapValue, transform, setFocus } from 'ref/tv/util/focusUtil';
import { checkHorizontalArrowDisplay } from 'ref/tv/util/domUtils';
import { getDefaultImageWidthByImageType } from 'ref/tv/util/itemUtils';
import Asset from '../Asset';
import ArrowButton from 'ref/tv/component/ArrowButton';
import sass from 'ref/tv/util/sass';
import './SeasonSelectorModal.scss';

const bem = new Bem('season-selector-modal');

interface SeasonSelectorProps {
	itemImageTypes?: { [key: string]: string };
}

interface SeasonSelectorModalProps extends React.HTMLProps<any> {
	show: api.ItemDetail;
	curIndex?: number;
	onItemClicked?: (index: number) => void;
}

interface SeasonSelectorModalState {
	curIndex?: number;
	listTrans: number;
	alignMiddle: boolean;
	showPrevArrow: boolean;
	showNextArrow: boolean;
}

class SeasonSelectorModal extends React.Component<
	SeasonSelectorProps & SeasonSelectorModalProps,
	SeasonSelectorModalState
> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	focusableRow: Focusable;
	private itemsRef;
	private curIndex: number;
	private imageType: image.Type;
	private imageWidth: number;

	constructor(props) {
		super(props);

		this.state = {
			curIndex: props.curIndex || 0,
			listTrans: 0,
			alignMiddle: false,
			showPrevArrow: false,
			showNextArrow: false
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: stopMove,
			moveDown: stopMove,
			exec: this.exec
		};

		this.curIndex = props.curIndex || 0;
		this.imageType = props.itemImageTypes.season;
		this.imageWidth = getDefaultImageWidthByImageType(this.imageType);
	}

	componentWillReceiveProps(nextProps: SeasonSelectorProps & SeasonSelectorModalProps) {
		if (nextProps.curIndex !== undefined && nextProps.curIndex !== this.state.curIndex) {
			this.curIndex = nextProps.curIndex;
			this.calcPosition();
		}
	}

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);
		this.calcPosition();
	}

	componentDidUpdate() {
		this.focusableRow.savedState = Object.assign({}, this.state);
	}

	private getSeasonItemCount = () => {
		if (this.props.show.seasons && this.props.show.seasons.items) {
			return this.props.show.seasons.items.length;
		}

		return 0;
	};

	private moveLeft = (): boolean => {
		const itemCount = this.getSeasonItemCount();
		if (itemCount > 0) {
			const tarIndex = wrapValue(this.state.curIndex - 1, 0, itemCount - 1, false);

			if (tarIndex !== this.state.curIndex) {
				this.curIndex = tarIndex;
				this.calcPosition();
			}
		}

		return true;
	};

	private moveRight = (): boolean => {
		const itemCount = this.getSeasonItemCount();
		if (itemCount > 0) {
			const tarIndex = wrapValue(this.state.curIndex + 1, 0, itemCount - 1, false);

			if (tarIndex !== this.state.curIndex) {
				this.curIndex = tarIndex;
				this.calcPosition();
			}
		}

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				const { onItemClicked } = this.props;
				const { curIndex } = this.state;
				if (onItemClicked) {
					onItemClicked(curIndex);
				}

				return true;
		}

		return false;
	};

	private onItemsRef = ref => {
		this.itemsRef = ref;
	};

	private calcPosition = () => {
		if (!this.itemsRef) return;

		const curIndex = this.curIndex;
		const { listTrans } = this.state;
		const itemWidth = this.imageWidth + sass.assetListItemMargin;
		const ipp = Math.floor(sass.contentWidth / itemWidth);
		const distance = ipp * itemWidth;
		const left = Math.max((this.itemsRef.clientWidth - sass.contentWidth) / 2, curIndex * itemWidth);
		const right = left + itemWidth;

		if (this.props.show.seasons.items.length <= ipp) {
			this.setState({ alignMiddle: true, curIndex });
			return;
		} else {
			this.setState({ curIndex });
		}

		if (left < Math.abs(listTrans)) {
			this.shift(false, left, right);
		}

		if (right - distance > Math.abs(listTrans)) {
			this.shift(true, left, right);
		}
	};

	private shift = (right: boolean, leftDistance?: number, rightDistance?: number, listTransDistance?: number) => {
		const itemWidth = this.imageWidth + sass.assetListItemMargin;
		const ipp = Math.floor(sass.contentWidth / itemWidth);
		const min = this.itemsRef.clientWidth - this.itemsRef.scrollWidth;
		const distance = ipp * itemWidth;
		let { listTrans } = this.state;

		if (listTransDistance) listTrans = listTransDistance;

		if (right) {
			listTrans -= distance;
			listTrans = Math.max(listTrans, min);
		} else {
			listTrans += distance;
			listTrans = Math.min(listTrans, 0);
		}

		if (listTrans !== 0 && leftDistance < Math.abs(listTrans)) {
			this.shift(false, leftDistance, rightDistance, listTrans);
			return;
		}

		if (listTrans !== min && rightDistance - distance > Math.abs(listTrans)) {
			this.shift(true, leftDistance, rightDistance, listTrans);
			return;
		}

		const arrowDisplay = this.checkArrowDisplay(listTrans);

		this.setState({
			showPrevArrow: arrowDisplay.showPrevArrow,
			showNextArrow: arrowDisplay.showNextArrow,
			listTrans: listTrans
		});
	};

	private checkArrowDisplay = (listTrans?: number) => {
		if (listTrans === undefined) {
			listTrans = this.state.listTrans;
		}

		return checkHorizontalArrowDisplay(listTrans, this.itemsRef.clientWidth, this.itemsRef.scrollWidth);
	};

	private next = () => {
		this.shift(true);
	};

	private previous = () => {
		this.shift(false);
	};

	private handleMouseEnter = () => {
		const arrowDisplay = this.checkArrowDisplay();
		this.setState({ showPrevArrow: arrowDisplay.showPrevArrow, showNextArrow: arrowDisplay.showNextArrow });
	};

	private handleMouseLeave = () => {
		this.setState({ showPrevArrow: false, showNextArrow: false });
	};

	private handleMouseEnterAsset = index => {
		this.setState({ curIndex: index });
	};

	render() {
		const { show, onItemClicked } = this.props;
		const { curIndex, showPrevArrow, showNextArrow, listTrans, alignMiddle } = this.state;
		const entries = show.seasons.items;
		const styleTransform = alignMiddle ? {} : transform(listTrans + 'px');

		return (
			<div className={bem.b()}>
				<div className={bem.e('titleDiv')}>
					<div className={bem.e('title')}>{show.title}</div>
				</div>

				<div className={bem.e('list')} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					<div className={bem.e('items', { alignMiddle })} style={styleTransform} ref={this.onItemsRef}>
						{entries &&
							entries.map((item, i) => {
								return (
									<Asset
										key={`${item.id}-${i}`}
										className={bem.e('item')}
										item={item}
										imageType={this.imageType}
										imageOptions={{ width: this.imageWidth }}
										itemMargin={10}
										titlePosition={'below'}
										focused={curIndex === i}
										onClick={onItemClicked}
										assetMouseEnter={this.handleMouseEnterAsset}
										index={i}
										isLastItem={i === entries.length - 1}
									/>
								);
							})}
					</div>

					<ArrowButton direction={'left'} onClick={this.previous} show={showPrevArrow} />
					<ArrowButton direction={'right'} onClick={this.next} show={showNextArrow} />
				</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): SeasonSelectorProps {
	return {
		itemImageTypes: state.app.config.general.itemImageTypes
	};
}

export default connect<SeasonSelectorProps, any, SeasonSelectorModalProps>(
	mapStateToProps,
	undefined
)(SeasonSelectorModal);
