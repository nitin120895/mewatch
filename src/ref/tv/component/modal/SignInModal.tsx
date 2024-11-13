import * as React from 'react';
import { InjectedIntl } from 'react-intl';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import CtaButton from '../CtaButton';
import { focusedClass } from 'ref/tv/util/focusUtil';
import './SignInModal.scss';

const logoImg = require('../../../../../resource/ref/tv/image/axis-logo.png');

const bem = new Bem('signin-modal');

type SignInModalProps = {
	focused?: boolean;
	code: string;
	websiteUrl: string;
	needsAction?: boolean;
	onClick?: () => void;
};

export default class SignInModal extends React.Component<SignInModalProps, any> {
	context: {
		intl: InjectedIntl;
	};

	static contextTypes: any = {
		intl: React.PropTypes.object.isRequired
	};

	constructor(props) {
		super(props);
	}

	private onClick = () => {
		const { needsAction, onClick } = this.props;

		if (needsAction && onClick) {
			onClick();
		}
	};

	render() {
		const { formatMessage } = this.context.intl;
		const { focused, code, websiteUrl, needsAction } = this.props;
		const subTitle = formatMessage({ id: 'signin_visit_website' }, { websiteUrl });

		return (
			<div className={bem.b({ focused })}>
				<img className={bem.e('logo')} src={logoImg} />
				<div className={bem.e('container')}>
					<div>
						<div className={bem.e('title')}>{formatMessage({ id: 'signin' })}</div>
						<div className={bem.e('text')}>{subTitle}</div>
						<div className={bem.e('code')}>{code}</div>
						<div className={bem.e('action', { needsAction })}>
							<div className={bem.e('text')}>{formatMessage({ id: 'signin_entered_the_code' })}</div>
							<CtaButton
								className={cx(bem.e('confirm'), focused ? focusedClass : '')}
								label={formatMessage({ id: 'signin_confirm' })}
								onClick={this.onClick}
							/>
							<div className={bem.e('text')}>{formatMessage({ id: 'signin_confirm_text' })}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
