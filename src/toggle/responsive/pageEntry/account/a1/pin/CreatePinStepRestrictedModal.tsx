import * as React from 'react';
import { bem, CreatePinSteps } from './CreatePinOverlay';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

interface Props {
	fromParentalControl: boolean;
	close: () => void;
	step: CreatePinSteps;
}

export default class CreatePinStepRestrictedModal extends React.Component<Props> {
	render() {
		const { fromParentalControl, close, step } = this.props;

		if (step !== CreatePinSteps.RestrictedAge) return false;

		return (
			<div className={bem.e('step')}>
				<IntlFormatter className={bem.e('title')} elementType="div">
					{fromParentalControl
						? '@{create_pin_overlay_parental_control_title|Parental Control}'
						: '@{create_pin_overlay_restricted_age_title|Control PIN}'}
				</IntlFormatter>

				<IntlFormatter className={bem.e('description')} elementType="div">
					{fromParentalControl
						? '@{create_pin_overlay_parental_control_under_age|You must be at least 21 years old to manage parental control settings.}'
						: '@{create_pin_overlay_restricted_age_label|You must be at least 21 years old to set a Control PIN.}'}
				</IntlFormatter>

				<div className={bem.e('buttons')}>
					<div className={bem.e('button', 'primary')} onClick={close}>
						<IntlFormatter elementType="span">{'@{create_pin_overlay_ok|OK}'}</IntlFormatter>
					</div>
				</div>
			</div>
		);
	}
}
