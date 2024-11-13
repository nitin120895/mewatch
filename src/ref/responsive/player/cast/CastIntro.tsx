import * as React from 'react';
import { Bem } from 'shared/util/styles';
import CastIcon from '../controls/icons/CastIcon';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import CtaButton from 'ref/responsive/component/CtaButton';
import FocusCaptureGroup from 'shared/component/FocusCaptureGroup';

import './CastIntro.scss';

const bem = new Bem('cast-intro');

interface CastIntroProps {
	onClick: () => void;
}

export default class CastIntro extends React.Component<CastIntroProps, any> {
	render() {
		const { onClick } = this.props;

		return (
			<div className={bem.e('overlay')} role="dialog">
				<div className={bem.e('overlay-inner')}>
					<FocusCaptureGroup className={bem.e('container')} autoFocus={true}>
						<IntlFormatter elementType="p" className={bem.e('label')}>
							{'@{chromecast_click_to_cast}'}
						</IntlFormatter>
						<IntlFormatter
							elementType={CtaButton}
							className={bem.e('dismiss-error')}
							onClick={onClick}
							formattedProps={{ 'aria-label': '@{chromecast_click_to_cast}' }}
							componentProps={{
								ordinal: 'primary'
							}}
						>
							{'@{error_dialog_button}'}
						</IntlFormatter>
					</FocusCaptureGroup>
				</div>
				<div className={bem.e('overlay-icon')}>
					<div className={bem.e('icon')}>
						<CastIcon />
					</div>
				</div>
			</div>
		);
	}
}
