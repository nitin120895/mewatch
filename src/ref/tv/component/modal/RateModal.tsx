import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import StarIcon from '../StarIcon';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { stopMove, wrapValue } from 'ref/tv/util/focusUtil';
import './RateModal.scss';

const bem = new Bem('rate-modal');

type RateModalProps = {
	defaultValue?: number;
	title: string;
	onClose: (value: number) => void;
};

type RateModalState = {
	curIndex?: number;
};

export default class RateModal extends React.Component<RateModalProps, RateModalState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	static defaultProps = {
		defaultValue: 1
	};

	focusableRow: Focusable;

	constructor(props) {
		super(props);

		this.state = {
			curIndex: props.defaultValue || 1
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: stopMove,
			moveDown: stopMove,
			exec: this.exec
		};
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveLeft = (): boolean => {
		// We make minIndex is 1 because it's not zero-based
		this.setState({ curIndex: wrapValue(this.state.curIndex - 1, 1, 5) });
		return true;
	};

	private moveRight = (): boolean => {
		// We make minIndex is 1 because it's not zero-based
		this.setState({ curIndex: wrapValue(this.state.curIndex + 1, 1, 5) });
		return true;
	};

	private exec = (act?: string): boolean => {
		this.context.focusNav.hideDialog();
		switch (act) {
			case 'click':
				this.props.onClose && this.props.onClose(this.state.curIndex);
				return true;
			case 'back':
			case 'esc':
				this.props.onClose && this.props.onClose(-1);
				return true;

			default:
				break;
		}

		return false;
	};

	private handleMouseEnter = index => {
		this.setState({ curIndex: index + 1 });
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	render() {
		const { title } = this.props;
		const { curIndex } = this.state;
		const stars = [1, 2, 3, 4, 5];
		return (
			<div className={bem.b()}>
				<div className={bem.e('container')}>
					<div className={bem.e('title')}>Rate {title}</div>
					<div className={bem.e('stars')}>
						{stars.map((s, i) => {
							return (
								<StarIcon
									key={`rate-star-${i}`}
									isActive={s <= curIndex}
									isFocused={s === curIndex}
									index={i}
									onMouseEnter={this.handleMouseEnter}
									onClick={this.handleMouseClick}
								/>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}
