import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { resolveAlignment, resolveColor } from '../../util/custom';

import './H10Text.scss';

const bem = new Bem('h10');

interface CustomFields {
	subheading?: string;
	backgroundColor: customFields.Color;
	textColor: customFields.Color;
	textHorizontalAlignment: position.AlignX;
}

export type H10PageEntryProps = TPageEntryTextProps<CustomFields>;

type H10PageEntryState = {
	collapsed: boolean;
};

export default class H10Text extends React.Component<H10PageEntryProps, H10PageEntryState> {
	private container: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			collapsed: false
		};
	}

	componentDidMount() {
		this.updateStyles(this.props.customFields);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.customFields !== prevProps.customFields) this.updateStyles(this.props.customFields);
	}

	private onContainerRef = node => (this.container = node);

	private updateStyles = customFields => {
		const { backgroundColor, textColor } = customFields;
		/* tslint:disable:no-null-keyword */
		this.container.style.backgroundColor = resolveColor(backgroundColor, null);
		this.container.style.color = resolveColor(textColor, null, true);
		/* tslint:enable */
		this.setState({ collapsed: !backgroundColor.color });
	};

	render() {
		const { text, template, customFields } = this.props;
		const { collapsed } = this.state;
		const { subheading, textHorizontalAlignment } = customFields;
		const alignmentClass = textHorizontalAlignment ? `txt-${resolveAlignment(textHorizontalAlignment)}` : '';
		const classNames = [bem.b({ collapsed }), 'full-bleed', alignmentClass];
		if (!classNames.indexOf(template)) classNames.unshift(template.toLowerCase());
		const classes = cx(...classNames);
		return (
			<div className={classes} ref={this.onContainerRef}>
				<div className="grid-margin">
					<h1 className={bem.e('heading')}>{text}</h1>
					{this.renderSubheading(subheading)}
				</div>
			</div>
		);
	}

	private renderSubheading(subheading) {
		if (!subheading) return;
		return <h2 className={bem.e('subHeading')}>{subheading}</h2>;
	}
}
