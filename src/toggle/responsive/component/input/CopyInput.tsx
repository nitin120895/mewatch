import * as React from 'react';
import { CTATypes } from 'shared/analytics/types/types';
import { Bem } from 'shared/util/styles';
import { copyToClipboard } from 'shared/util/function';

import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';
import LinkIcon from 'toggle/responsive/component/icons/LinkIcon';

import './CopyInput.scss';

const bem = new Bem('copy-input');

export interface CopyInputProps extends React.HTMLProps<HTMLInputElement> {
	id: string;
	name: string;
	value?: string;
	label?: string;
	onCopied?: () => void;
}

export default class CopyInput extends React.Component<CopyInputProps> {
	private onClick = () => {
		const { onCopied, value } = this.props;
		copyToClipboard(value, onCopied);
	};

	render() {
		const { id, name, value, label } = this.props;
		return (
			<div className={bem.b()}>
				<IntlFormatter elementType="label" htmlFor={id} className={bem.e('label')} aria-hidden={true}>
					{label}
				</IntlFormatter>
				<div className={bem.e('input-group')}>
					<input className={bem.e('input')} id={id} name={name} type="text" value={value} readOnly />
					<CTAWrapper type={CTATypes.CopyLink}>
						<button className={bem.e('button')} onClick={this.onClick}>
							<LinkIcon className={bem.e('icon')} />
						</button>
					</CTAWrapper>
				</div>
			</div>
		);
	}
}
