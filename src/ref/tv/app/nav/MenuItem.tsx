import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { InjectedIntl } from 'react-intl';
import * as cx from 'classnames';
import './MenuItem.scss';

interface MenuItemProps extends React.Props<any> {
	entry?: api.NavEntry;
	entryType?: string;
	onFocus?: (index) => void;
	onItemClick?: () => void;
	focused?: boolean;
	selected?: boolean;
	secondary?: boolean;
	index: number;
	onMouseEnter?: (index) => void;
}

const bem = new Bem('menu-item');

export default class MenuItem extends React.Component<MenuItemProps, any> {
	context: {
		intl: InjectedIntl;
	};

	static contextTypes: any = {
		intl: React.PropTypes.object.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			focused: props.focused,
			selected: props.selected,
			secondary: props.secondary
		};
	}

	componentWillReceiveProps(nextProps: MenuItemProps) {
		if (this.props.selected !== nextProps.selected) {
			this.setState({
				selected: nextProps.selected
			});
		}

		if (this.props.focused !== nextProps.focused) {
			this.setState({
				focused: nextProps.focused
			});

			if (nextProps.focused) {
				const { onFocus, index } = this.props;

				if (onFocus) {
					onFocus(index);
				}
			}
		}
	}

	onFocusPrimary = () => {
		const { onFocus, index } = this.props;

		if (onFocus) {
			onFocus(index);
		}
	};

	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	render() {
		const { entry, entryType, onItemClick } = this.props;

		if (!entry || !entry.label) return <div />;

		const { focused, selected, secondary } = this.state;
		const className = cx(
			bem.b({ secondary, focused, selected, tertiary: entryType === 'item', clickable: entry.path !== undefined })
		);

		if (entryType === 'primary' && entry.path !== '/') {
			return (
				<div
					tabIndex={0}
					className={className}
					onFocus={this.onFocusPrimary}
					onClick={onItemClick}
					onMouseEnter={this.handleMouseEnter}
				>
					{entry.label}
				</div>
			);
		} else if (entry.path === '@lang') {
			return (
				<div
					tabIndex={0}
					className={bem.b({ secondary, focused, lang: true })}
					onClick={onItemClick}
					onMouseEnter={this.handleMouseEnter}
					style={{ overflow: 'visible' }}
				>
					{this.context.intl.formatMessage({ id: 'change_language' })}
					<div className={bem.e('button', { focused })}>
						<div className={bem.e('globe', { focused })} />
						<span>{entry.label}</span>
						<i className={cx(bem.e('icon'), 'icon icon-drop-button')} />
					</div>
				</div>
			);
		} else {
			return (
				<div tabIndex={0} className={className} onClick={onItemClick} onMouseEnter={this.handleMouseEnter}>
					{entry.label}
				</div>
			);
		}
	}
}
