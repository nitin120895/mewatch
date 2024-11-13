import * as React from 'react';
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl';

export interface FormattedValue {
	type: 'date' | 'time' | 'relative' | 'number' | 'plural' | 'string';
	value: any;
	formatOptions?: any;
}

export type IntlValue = FormattedValue | string | number | boolean | Date;
export type IntlValues = { [key: string]: IntlValue };

interface IntlFormatterProps extends React.HTMLProps<any> {
	elementType?: string | React.ComponentClass<any> | React.StatelessComponent<any>;
	componentProps?: any;
	formattedProps?: { [key: string]: string };
	values?: IntlValues;
	defaults?: { [key: string]: string };

	/**
	 * Activate recursive processing of all children inside the IntlFormatter.
	 * Nested processing should only be activated in cases where it's necessary,
	 * as it may be costly to recursively clone a complex nested DOM tree.
	 */
	nested?: boolean;

	// @deprecated Please use `elementType` instead of `tagName`.
	tagName?: string;
}

interface IntlFormatterState {
	values?: { [key: string]: string };
}

type InjectedIntlFormatterProps = IntlFormatterProps & InjectedIntlProps;

/**
 * react-intl formatter (using react-intl injectIntl and formatMessage)
 *
 * Use this to format multiple labels at the same time
 *
 * Example:
 * <IntlFormatter elementType="p">
 * 	{"@{message_id|defaultMessage} 1234 @{message_id2|defaultMessage} 5678"}
 * </IntlFormatter>
 *
 * Renders:
 *
 * <p>
 * 	formattedMessage 1234 formattedMessage2 5678
 * </p>
 *
 * For aria-label
 * <IntlFormatter
 * 	elementType="button"
 * 	formattedProps={{ 'aria-label': '@{message_id|defaultMessage}' }}
 * >
 * 	<SVGIconPath />
 * </IntlFormatter>
 *
 * Renders:
 *
 * <button aria-label="formatted message">
 * 	<SVGIconPath />
 * </button>
 *
 * By default, it uses <span> as the elementType
 */
class IntlFormatter extends React.PureComponent<InjectedIntlFormatterProps, IntlFormatterState> {
	static defaultProps = {
		// When we eventually remove `tagName` this default should be replaced with `elementType`.
		tagName: 'span'
	};

	constructor(props: InjectedIntlFormatterProps) {
		super(props);
		this.state = {
			values: this.formatValues(props.values, props.intl)
		};
	}

	componentWillReceiveProps(nextProps: InjectedIntlFormatterProps) {
		const { values, intl } = this.props;
		if (nextProps.values !== values || intl.locale !== nextProps.intl.locale) {
			this.setState({ values: this.formatValues(nextProps.values, nextProps.intl) });
		}
	}

	private formatValues(values: IntlValues, intl: InjectedIntl) {
		if (!values) return undefined;
		const formattedValues = {};
		for (let key in values) {
			const value = values[key];
			if (!value || typeof value !== 'object' || value instanceof Date) {
				formattedValues[key] = value;
			} else {
				formattedValues[key] = this.getFormattedValue(values[key] as FormattedValue, intl);
			}
		}
		return formattedValues;
	}

	private getFormattedValue({ type, value, formatOptions }: FormattedValue, intl: InjectedIntl) {
		switch (type) {
			case 'date':
				return intl.formatDate(value, formatOptions);
			case 'time':
				return intl.formatTime(value, formatOptions);
			case 'relative':
				return intl.formatRelative(value, formatOptions);
			case 'number':
				return intl.formatNumber(value, formatOptions);
			case 'plural':
				return intl.formatPlural(value, formatOptions);
			default:
				return value;
		}
	}

	private formatMessage = (message: string) => {
		return message.replace(/@\{([^@]+)\}/g, this.getFormattedMessage);
	};

	private getFormattedMessage = (match: string, p1: string) => {
		const { intl, defaults } = this.props;
		let [id, defaultMessage] = p1.split('|');
		if (!defaultMessage && defaults) defaultMessage = defaults[id];
		return intl.formatMessage({ id, defaultMessage }, this.state.values);
	};

	private formatChildren = (children: any) => {
		if (typeof children === 'string') {
			return this.formatMessage(children);
		} else if (typeof children === 'object' && Array.isArray(children)) {
			return children.map(this.formatChild);
		}
		return children;
	};

	private formatChild = (child: any) => {
		if (typeof child === 'string') {
			return this.formatMessage(child);
		} else if (this.props.nested && typeof child === 'object') {
			return React.cloneElement(child, {
				children: this.formatChildren(child.props.children)
			});
		}
		return child;
	};

	render() {
		// tslint:disable:no-unused-variable
		const {
			intl,
			values,
			defaults,
			formattedProps,
			elementType,
			tagName,
			componentProps,
			children,
			nested,
			...others
		} = this.props;
		// tslint:enable

		if (children) {
			others['children'] = this.formatChildren(children);
		}

		if (formattedProps) {
			for (const propName in formattedProps) {
				if (formattedProps[propName] === undefined) continue;
				others[propName] = this.formatMessage(formattedProps[propName]);
			}
		}

		if (typeof elementType === 'string') {
			return React.createElement(elementType, others);
		} else if (!elementType && tagName) {
			return React.createElement(tagName, others);
		}

		const ComponentClass = elementType;
		const componentChildren = others['children'];
		delete others['children'];
		return (
			<ComponentClass {...others} {...componentProps}>
				{componentChildren}
			</ComponentClass>
		);
	}
}

export default injectIntl<IntlFormatterProps>(IntlFormatter);
