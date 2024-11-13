import { UserActionDescription } from '../action';

export enum RegistrationDataAction {
	Started = 'started',
	Completed = 'completed',
	Canceled = 'canceled'
}

export type IRegistrationData<A extends RegistrationDataAction, N extends number> = {
	registration: {
		step: number;
		action: RegistrationDataAction;
		trigger: string;
	};
};

export interface IRegisteredPlanData {
	id: string;
	title: string;
	type: string;
	revenueType: string;
	hasTrialPeriod: boolean;
	trialPeriodDays: number;
	billingPeriodType: string;
	billingPeriodFrequency: number;
	currency: string;
	value: number;
}

export interface IUserActionedTrackingEventDetail {
	action: UserActionDescription;
	value?: string;
}

export interface IUserRegisteredTrackingEventDetail {
	newsletters: string[];
}

export interface IUserRegisteredEventDetail
	extends IUserRegisteredTrackingEventDetail,
		IRegistrationData<RegistrationDataAction.Started | RegistrationDataAction.Canceled, number> {}

export interface IUserRegisteringEventDetail extends IRegistrationData<RegistrationDataAction.Completed, 3> {}
