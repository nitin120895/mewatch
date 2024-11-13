import * as React from 'react';
import * as PropTypes from 'prop-types';
import { resolveAlignment } from 'ref/tv/util/itemUtils';
import EntryTitle from 'ref/tv/component/EntryTitle';
import ScrollableTextModal from 'ref/tv/component/modal/ScrollableTextModal';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove, skipMove } from 'ref/tv/util/focusUtil';
import { FormattedMessage } from 'react-intl';
import { Bem } from 'shared/util/styles';
import EdHtml from './EdHtml';
import sass from 'ref/tv/util/sass';
import { setPaddingStyle } from 'ref/tv/util/rows';
import './Ed2Text.scss';

const bem = new Bem('ed2');

interface Ed2CustomFields {
	textColor?: customFields.Color;
	textHorizontalAlignment?: position.AlignX;
}

export default class Ed2Text extends React.Component<PageEntryTextProps, any> {
	context: {
		router: ReactRouter.InjectedRouter;
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		router: PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private ref: HTMLElement;
	private contentRef: HTMLElement;

	constructor(props) {
		super(props);

		this.state = {
			isFocused: false
		};

		this.focusableRow = {
			focusable: true,
			index: (props.index + 1) * 10,
			dynamicHeight: true,
			height: 1,
			template: props.template,
			entryProps: props,
			restoreSavedState: this.setState,
			setFocus: this.setFocus,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: skipMove,
			moveDown: skipMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;

		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	private setFocus = (isFocus?: boolean): boolean => {
		this.setState({
			isFocused: isFocus
		});

		return true;
	};

	private exec = (act?: string): boolean => {
		switch (act) {
			case 'click':
				this.invokeItem();
				return true;
			default:
				break;
		}

		return false;
	};

	private invokeItem = () => {
		if (this.showMore()) {
			const { text, customFields } = this.props;
			this.context.focusNav.showDialog(<ScrollableTextModal text={text} customFields={customFields} />);
		}
	};

	private showMore = () => {
		return this.state.isFocused && this.contentRef && this.contentRef.scrollHeight > 0.75 * sass.viewportHeight;
	};

	private handleMouseEnter = () => {
		this.context.focusNav.handleRowMouseEnter(this.focusableRow.index);
	};

	private handleMouseLeave = () => {
		this.setFocus(false);
	};

	private handleClick = () => {
		this.invokeItem();
	};

	render(): any {
		const { text, customFields } = this.props;
		const { isFocused } = this.state;
		const custom = (customFields || {}) as Ed2CustomFields;
		return (
			<div className={bem.b()} ref={ref => (this.ref = ref)}>
				<EntryTitle {...this.props} />
				<div
					className={bem.e('background', resolveAlignment(custom.textHorizontalAlignment), { focused: isFocused })}
					style={{ color: custom.textColor.color }}
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
					onClick={this.handleClick}
				>
					<div
						className={bem.e('html')}
						ref={ref => (this.contentRef = ref)}
						style={{ opacity: custom.textColor.opacity / 100 }}
					>
						<EdHtml innerHTML={text} />
					</div>
					{this.showMore() && (
						<FormattedMessage id="more_btn">
							{value => (
								<div className={bem.e('more')} onClick={this.handleClick}>
									{value}
								</div>
							)}
						</FormattedMessage>
					)}
					{isFocused && <div className={bem.e('focus-underline')} />}
				</div>
			</div>
		);
	}
}
