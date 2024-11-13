import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter, { IntlValue } from 'ref/responsive/component/IntlFormatter';

import './HelpCircle.scss';

interface Props {
	children?: string | IntlValue;
	className?: string;
}

interface HelpCircleState {
	visible: boolean;
}

const bem = new Bem('help-circle');

export default class HelpCircle extends React.Component<Props, HelpCircleState> {
	state: HelpCircleState = {
		visible: false
	};

	private onTouchEnd = () => {
		const { visible } = this.state;
		this.setState({ visible: !visible }, () => {
			if (visible) {
				document.removeEventListener('touchend', this.onTouchEnd);
			} else {
				document.addEventListener('touchend', this.onTouchEnd);
			}
		});
	};

	render() {
		const { children, className } = this.props;
		return (
			<span
				className={cx(className, bem.b())}
				onTouchEnd={this.onTouchEnd}
				onMouseEnter={() => this.setState({ visible: true })}
				onMouseLeave={() => this.setState({ visible: false })}
			>
				<span className={bem.e('mark')}>?</span>
				{children && (
					<IntlFormatter elementType="div" className={bem.e('content', { visible: this.state.visible })}>
						{children}
					</IntlFormatter>
				)}
			</span>
		);
	}
}
