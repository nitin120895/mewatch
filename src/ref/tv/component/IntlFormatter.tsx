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
	tagName?: string;
	formattedAriaLabel?: string;
	values?: IntlValues;
	defaults?: any;
	args?: { [key: string]: string };
}

interface IntlFormatterState {
	values?: { [key: string]: string };
}

type InjectedIntlFormatterProps = IntlFormatterProps & InjectedIntlProps;

/**
 * react-intl Formatter (using react-intl FormattedMessage)
 *
 * Use this to format multiple labels at the same time
 *
 * Example:
 * <IntlFormatter tagName={"p"}>
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
 * 	tagName={button}
 * 	formattedAriaLabel="@{message_id|defaultMessage}"
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
 * By default, it uses <span> as tagName.
 */
class IntlFormatter extends React.Component<InjectedIntlFormatterProps, IntlFormatterState> {
	static defaultProps = {
		tagName: 'span'
	};

	constructor(props: InjectedIntlFormatterProps) {
		super(props);
		this.state = {
			values: this.formatValues(props.values, props.intl)
		};
	}

	componentWillReceiveProps(nextProps: InjectedIntlFormatterProps) {
		if (nextProps.values !== this.props.values || this.props.intl.locale !== nextProps.intl.locale) {
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
		let ret = message.replace(/@\{([^@]+)\}/g, this.getFormattedMessage);

		const { args } = this.props;
		if (args) {
			for (let key in args) {
				ret = ret.replace(`\$${key}\$`, args[key]);
			}
		}

		return ret;
	};

	private getFormattedMessage = (match: string, p1: string) => {
		const { intl, defaults } = this.props;
		let [id, defaultMessage] = p1.split('|');
		if (!defaultMessage && defaults) defaultMessage = defaults[id];
		return intl.formatMessage({ id, defaultMessage }, this.state.values);
	};

	render() {
		// tslint:disable-next-line
		const { intl, values, defaults, formattedAriaLabel, tagName, children, ...others } = this.props;

		if (children) {
			if (typeof children === 'string') {
				others['children'] = this.formatMessage(children);
			} else {
				others['children'] = children;
			}
		}

		if (formattedAriaLabel) {
			others['aria-label'] = this.formatMessage(formattedAriaLabel);
		}

		return React.createElement(tagName, others);
	}
}

export default injectIntl<IntlFormatterProps>(IntlFormatter);
