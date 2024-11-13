import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import './DropButton.scss';

/**
 * Drop down option
 *
 * @param {string} label Label displayed to the user for a drop down option.
 * 						 This can be human readable or if used in conjunction with useTranslations
 * 						 on the parent drop down will use IntlFormatter to display a localized value
 * @param {string} key Key associated with the drop down option. This will not be directly shown to the user.
 */
export interface DropButtonOption {
	label: string;
	key: string;
}

export interface DropButtonProps {
	label?: string;
	className?: string;
	curIndex?: number;
	selectedKey?: string;
	defaultOption?: DropButtonOption;
	options?: DropButtonOption[];
	onMouseEnter?: (focusState?: string) => void;
	onClick?: (focusState?: string) => void;
	dropBtnState?: string;
}

export interface DropButtonState {}

const bem = new Bem('drop-button');

export const PLACEHOLDER_KEY = '__placeholder';

export class DropButton extends React.Component<DropButtonProps, DropButtonState> {
	static defaultProps = {
		useTranslations: false
	};

	constructor(props) {
		super(props);
	}

	private getSelectedLabel(props: DropButtonProps): string {
		const { options, selectedKey, defaultOption } = props;
		const option = selectedKey && selectedKey !== defaultOption.key && options.find(o => o.key === selectedKey);
		return option ? option.label : props.label;
	}

	private handleMouseEnter = () => {
		const { onMouseEnter, dropBtnState } = this.props;
		onMouseEnter && onMouseEnter(dropBtnState);
	};

	private handleMouseClick = () => {
		const { onClick, dropBtnState } = this.props;
		onClick && onClick(dropBtnState);
	};

	render() {
		const { className, curIndex, options } = this.props;

		let label = '';
		if (curIndex !== undefined) {
			label = options[curIndex].label;
		} else {
			label = this.getSelectedLabel(this.props);
		}

		return (
			<div className={cx(bem.b(), className)} onMouseEnter={this.handleMouseEnter} onClick={this.handleMouseClick}>
				<div className={bem.e('btn')}>
					<IntlFormatter elementType="span" className={bem.e('title')}>
						{`@{${label}}`}
					</IntlFormatter>

					<i className={cx(bem.e('icon'), 'icon icon-drop-button')} />
				</div>
				<div className={bem.e('bar')} />
			</div>
		);
	}
}
