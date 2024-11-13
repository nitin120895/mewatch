import * as React from 'react';
import { resolveAlignment, resolveColor } from '../util/custom';
import EntryTitle from 'ref/responsive/component/EntryTitle';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';

import './Ed2Text.scss';

interface CustomFields {
	textColor?: customFields.Color;
	textHorizontalAlignment?: position.AlignX;
}

type Ed2PageEntryProps = TPageEntryTextProps<CustomFields>;

const bem = new Bem('ed2');

export default class Ed2Text extends React.Component<Ed2PageEntryProps, any> {
	private container: HTMLElement;

	componentDidMount() {
		this.updateColor(this.props.customFields);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.customFields !== prevProps.customFields) this.updateColor(this.props.customFields);
	}

	private onContainerRef = node => (this.container = node);

	private updateColor = customFields => {
		if (!customFields.textColor) {
			this.container.style.color = '';
			return;
		}
		const textColor = { ...customFields.textColor, opacity: 100 };
		/* tslint:disable-next-line:no-null-keyword */
		this.container.style.color = resolveColor(textColor, null);
	};

	render() {
		const { text, customFields } = this.props;
		const { textColor, textHorizontalAlignment } = customFields;
		const color = textColor && textColor.color;

		return (
			<div>
				<EntryTitle {...this.props} />
				<div
					ref={this.onContainerRef}
					dangerouslySetInnerHTML={{ __html: text }}
					className={cx(
						bem.b({ 'app-txt-color': !color }),
						`txt-${resolveAlignment(textHorizontalAlignment)}`,
						'clearfix'
					)}
				/>
			</div>
		);
	}
}
