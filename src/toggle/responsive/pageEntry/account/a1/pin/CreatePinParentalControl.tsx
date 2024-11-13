import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { redirectToMeConnectSettings } from 'shared/account/accountUtil';
import { goToAccounts } from 'shared/account/profileUtil';
import { Account as AccountPageKey } from 'shared/page/pageKey';
import { getPathByKey } from 'shared/page/sitemapLookup';
import OpenBrowser from 'toggle/responsive/component/icons/OpenBrowser';
import RestrictedContentIcon from 'toggle/responsive/component/icons/RestrictedContentIcon';
import { AgeGroup } from 'toggle/responsive/pageEntry/account/a1/pin/AccountManagePinComponent';
import { bem, CreatePinSteps } from './CreatePinOverlay';

interface Props {
	step: CreatePinSteps;
	account: api.Account;
	close?: () => void;
	age?: number;
	config?: state.Config;
}

export enum DefaultRatedAge {
	NC16 = 16,
	M18 = 18,
	R21 = 21
}

export default class CreatePinParentalControl extends React.Component<Props> {
	private onProceedClick = (reject: boolean) => e => {
		const { close, config, account, age } = this.props;
		const { ageGroup } = account;
		if (ageGroup === AgeGroup.A) goToAccounts(getPathByKey(AccountPageKey, config));
		else if (ageGroup !== AgeGroup.A) {
			redirectToMeConnectSettings();
			!age && close();
		} else if (reject) close();
	};

	private ratedContentControl = () => {
		const { age, account } = this.props;
		const { ageGroup } = account;

		if ((age && this.isContentPlayingAbove21(age)) || ageGroup === AgeGroup.A) return true;
		return false;
	};

	getTitle() {
		if (this.ratedContentControl()) return '@{create_pin_overlay_pin_title_rated|Rated Content Control}';
		return '@{restricted_content| Rated Content}';
	}

	getDescription() {
		if (this.ratedContentControl())
			return '@{r21_set_up_your_control_pin_rated_content_description|Set up Your Control PIN in Account Settings to unlock R21 content.}';
		return '@{create_pin_overlay_age_control_description|You must be at least {age} years old to access this content.}';
	}

	isContentPlayingAbove21(age) {
		switch (age) {
			case DefaultRatedAge.NC16:
			case DefaultRatedAge.M18:
				return false;
			case DefaultRatedAge.R21:
				return true;
		}
	}

	getButtonLabel() {
		if (this.ratedContentControl()) return '@{create_pin_overlay_pin_button_rated|Go to Account Settings}';
		return '@{create_pin_overlay_pin_update_date_of_birth|Update your date of birth}';
	}

	render() {
		const { step, account, age } = this.props;
		if (step !== CreatePinSteps.ParentalControl) return false;

		const reject = account.ageGroup && account.ageGroup !== AgeGroup.E;
		return (
			<div className={bem.e('step')}>
				{age && <RestrictedContentIcon className={bem.e('icon')} />}
				<IntlFormatter className={bem.e('title')} elementType="div">
					{this.getTitle()}
				</IntlFormatter>

				<IntlFormatter className={bem.e('description')} elementType="div" values={{ age }}>
					{this.getDescription()}
				</IntlFormatter>

				<IntlFormatter elementType="div" className={bem.e('buttons')}>
					<IntlFormatter
						elementType="button"
						className={bem.e('button', 'primary')}
						onClick={this.onProceedClick(reject)}
					>
						{age && !this.isContentPlayingAbove21(age) && <OpenBrowser className={bem.e('open-browser-icon')} />}
						<IntlFormatter className={bem.e('button-label')}>{this.getButtonLabel()}</IntlFormatter>
					</IntlFormatter>
				</IntlFormatter>
			</div>
		);
	}
}
