import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import { ellipsisText } from 'ref/tv/util/text';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove, focusedClass } from 'ref/tv/util/focusUtil';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import ScrollableTextModal from 'ref/tv/component/modal/ScrollableTextModal';
import { FormattedMessage } from 'react-intl';
import './Description.scss';

interface DescriptionProps {
	index?: number;
	focusable?: boolean;
	description: string;
	title?: string;
	className?: string;
	afterEllipsis?: (isEllipsis: boolean) => void;
	setDescHeight?: (descHeight: number) => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onClick?: () => void;
}

type DescriptionState = Partial<{
	isEllipsis: boolean;
	description: string;
	text: string;
	isFocused: boolean;
}>;

const bem = new Bem('d1-season-desc');

export default class Description extends React.Component<DescriptionProps, DescriptionState> {
	static defaultProps = {
		focusable: true
	};

	static contextTypes: any = {
		focusNav: React.PropTypes.object.isRequired
	};

	context: {
		focusNav: DirectionalNavigation;
	};

	private focusableRow: Focusable;
	private refContent: HTMLElement;
	private ref: HTMLDivElement;
	private hasEllipsis: boolean;

	constructor(props) {
		super(props);

		this.state = {
			isEllipsis: false,
			text: props.description,
			description: props.description,
			isFocused: false
		};

		if (props.focusable) {
			this.focusableRow = {
				focusable: false,
				index: props.index,
				dynamicHeight: true,
				height: 1,
				restoreSavedState: this.setState,
				setFocus: this.setFocus,
				moveLeft: stopMove,
				moveRight: stopMove,
				moveUp: skipMove,
				moveDown: skipMove,
				exec: this.exec
			};
		}
	}

	componentDidMount() {
		if (this.props.focusable) {
			this.context.focusNav.registerRow(this.focusableRow);
			this.focusableRow.ref = this.refContent;
		} else {
			this.refContent && this.props.setDescHeight && this.props.setDescHeight(this.refContent.offsetHeight);
		}

		this.ellipsisText();
	}

	componentWillUnmount() {
		if (this.props.focusable) this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate() {
		this.ellipsisText();
		this.refContent && this.props.setDescHeight && this.props.setDescHeight(this.refContent.offsetHeight);
	}

	componentWillReceiveProps(newProps: DescriptionProps) {
		if (newProps.description !== undefined && newProps.description !== this.state.description) {
			this.hasEllipsis = false;
			this.setState({ description: newProps.description });
		}
	}

	private setFocus = (isFocus?: boolean): boolean => {
		if (this.focusableRow && this.focusableRow.focusable) {
			this.setState({ isFocused: isFocus });
			return true;
		}

		return false;
	};

	private exec = (act?: string): boolean => {
		const { isFocused } = this.state;

		switch (act) {
			case 'click':
				isFocused &&
					this.context.focusNav.showDialog(
						<ScrollableTextModal text={this.props.description} title={this.props.title} textWrap />
					);
				return true;
			default:
				break;
		}

		return false;
	};

	private ellipsisText = () => {
		if (!this.ref) return;

		if (this.hasEllipsis && this.ref.scrollHeight <= this.ref.clientHeight) return;

		if (!this.hasEllipsis && this.ref.scrollHeight <= this.ref.clientHeight) {
			this.displayNormalText();
		}

		this.displayEllipsisText();
	};

	private displayNormalText = () => {
		const { description } = this.props;

		this.setState({ text: description, isEllipsis: false, isFocused: false });

		if (this.focusableRow) this.focusableRow.focusable = false;

		this.hasEllipsis = true;
		this.props.afterEllipsis && this.props.afterEllipsis(false);
	};

	private displayEllipsisText = () => {
		const { description } = this.props;

		const text = ellipsisText(this.ref, description);
		this.setState({ text });

		this.hasEllipsis = true;

		if (description !== text) {
			this.setState({
				isEllipsis: true
			});

			if (this.props.focusable) {
				this.focusableRow.focusable = true;
			}

			this.props.afterEllipsis && this.props.afterEllipsis(true);
		}
	};

	private onRefContent = ref => {
		this.refContent = ref;
	};

	private onRefTest = ref => {
		this.ref = ref;
	};

	private onMouseEnter = () => {
		if (this.focusableRow && this.focusableRow.focusable) {
			this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
		}
	};

	private onMouseLeave = () => {
		this.setFocus(false);
	};

	private onClick = () => {
		if (this.focusableRow && this.focusableRow.focusable) this.exec('click');
	};

	render() {
		const { description, className, onMouseEnter, onMouseLeave, onClick } = this.props;
		const isEllipsis = this.state.isEllipsis;
		const isFocused = this.state.isFocused;
		const text = this.state.text;

		return (
			<div className={'desc-container'}>
				<div
					className={cx(className, bem.b({ isEllipsis }), isFocused ? focusedClass : '')}
					ref={this.onRefContent}
					onMouseEnter={onMouseEnter ? onMouseEnter : this.onMouseEnter}
					onMouseLeave={onMouseLeave ? onMouseLeave : this.onMouseLeave}
					onClick={onClick ? onClick : this.onClick}
				>
					<div className={bem.e('text')}>
						{text}
						<div className={bem.e('test')} ref={this.onRefTest}>
							{description}
						</div>
					</div>
					<FormattedMessage id="more_btn">
						{value => (
							<button className={cx(bem.e('button', { isEllipsis }), isFocused ? focusedClass : '')}>{value}</button>
						)}
					</FormattedMessage>
				</div>
			</div>
		);
	}
}
