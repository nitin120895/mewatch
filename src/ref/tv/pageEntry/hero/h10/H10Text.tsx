import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { resolveAlignment, resolveColor } from '../../../util/itemUtils';
import { UnfocusableRow } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { setPaddingStyle } from 'ref/tv/util/rows';
import sass from 'ref/tv/util/sass';
import './H10Text.scss';

const bem = new Bem('h10');

interface H10CustomFields {
	subheading?: string;
	backgroundColor: customFields.Color;
	textColor: customFields.Color;
	textHorizontalAlignment: position.AlignX;
}

class H10Text extends React.Component<PageEntryTextProps, any> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: UnfocusableRow;
	private ref: HTMLElement;

	constructor(props) {
		super(props);

		this.state = {
			focused: false
		};

		this.focusableRow = new UnfocusableRow(10);
	}

	componentDidMount() {
		let entryNode: HTMLElement = this.context.focusNav.getRowEntry(this.props.index);

		if (!entryNode) entryNode = this.ref;

		setPaddingStyle(entryNode, this.props.customFields);
		this.focusableRow.ref = this.ref;
		this.focusableRow.template = this.props.template;
		this.focusableRow.height = this.props.customFields.subheading ? sass.h10Height : sass.h10LessHeight;
		this.focusableRow.entryProps = this.props;

		this.updateStyles(this.props.customFields);
		this.context.focusNav.registerRow(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.unregisterRow(this.focusableRow);
	}

	componentDidUpdate(prevProps) {
		if (this.props.customFields !== prevProps.customFields) {
			this.updateStyles(this.props.customFields);
		}
	}

	private updateStyles = customFields => {
		if (!customFields) return;
		const custom = this.props.customFields as H10CustomFields;
		const { backgroundColor, textColor } = custom;

		this.ref.style.backgroundColor = resolveColor(backgroundColor, '#000');
		this.ref.style.color = resolveColor(textColor, '#fff');
	};

	private onRef = ref => {
		this.ref = ref;
	};

	render() {
		const { text, template, customFields } = this.props;
		const { subheading, textHorizontalAlignment } = customFields as H10CustomFields;
		const classNames = [
			bem.b(),
			bem.b(subheading ? 'hasSub' : ''),
			'full-bleed',
			`txt-${resolveAlignment(textHorizontalAlignment)}`
		];
		if (!classNames.indexOf(template)) classNames.unshift(template.toLowerCase());
		const classes = cx(...classNames);
		return (
			<div className={classes} ref={this.onRef}>
				<div className="content-margin">
					<div className={bem.e('heading')}>{text}</div>
					{this.renderSubheading(subheading)}
				</div>
			</div>
		);
	}

	private renderSubheading(subheading) {
		if (!subheading) return;
		return <div className={bem.e('subHeading')}>{subheading}</div>;
	}
}

export default H10Text;
