import { expect } from 'chai';
import { UserContext } from 'shared/analytics/types/v3/context/user';
import { populateLotameUserData } from 'shared/analytics/api/video';

const lotameData = {
	ClientID: '5799',
	AudienceClientID: '5225',
	seg: [
		'PageName:sg:mewatch:online:watch:20130327:230720_Start Up ! 创 ! - S1E2',
		'MediaInfo:mewatch:230720:30:F:340:NA:ZH:NA:2:NA:M:MediaCorp:NA:RO|DR',
		'DeviceType:mewatch:online',
		'DeviceOS:mewatch:web',
		'Section:mewatch:Section:watch',
		'ContentType:mewatch:Video',
		'ContentLanguage:mewatch:ZH',
		'ContentTitle:mewatch:230720:Start Up ! 创 ! - S1E2',
		'MediaChannel:mewatch:Video:NA',
		'VideoGenre:mewatch:Video:Genre:RO|DR',
		'VideoSeriesName:mewatch:Video:Start Up ! 创 !',
		'DomainName:mewatch.sg',
		'UserType:mewatch:UserType:<Free or Paid to be set by client application>',
		'LoggedInStatus:mewatch:LoggedIn:<True/False to be set by client application>',
		'Location:mewatch:<2 digit country code to be set by client appliation>'
	]
};

describe('Lotame User Data', () => {
	it('Should populate data for users who are not logged in', () => {
		const mockAnonUser: UserContext = {
			locale: 'en-us',
			clientId: '5799',
			userGroup: 'Anonymous',
			profiles: []
		};

		expect(populateLotameUserData(lotameData, mockAnonUser)).to.deep.equal({
			ClientID: '5799',
			AudienceClientID: '5225',
			seg: [
				'PageName:sg:mewatch:online:watch:20130327:230720_Start Up ! 创 ! - S1E2',
				'MediaInfo:mewatch:230720:30:F:340:NA:ZH:NA:2:NA:M:MediaCorp:NA:RO|DR',
				'DeviceType:mewatch:online',
				'DeviceOS:mewatch:web',
				'Section:mewatch:Section:watch',
				'ContentType:mewatch:Video',
				'ContentLanguage:mewatch:ZH',
				'ContentTitle:mewatch:230720:Start Up ! 创 ! - S1E2',
				'MediaChannel:mewatch:Video:NA',
				'VideoGenre:mewatch:Video:Genre:RO|DR',
				'VideoSeriesName:mewatch:Video:Start Up ! 创 !',
				'DomainName:mewatch.sg',
				'UserType:mewatch:UserType:Free',
				'LoggedInStatus:mewatch:LoggedIn:False',
				'Location:mewatch:sg'
			]
		});
	});

	it('Should populate data for users who are logged in and have a subscription', () => {
		const mockRegisteredUser: UserContext = {
			clientId: '94cf5739-04e7-4d32-a48a-8fa69a4b49c5',
			userId: 'b0eae272-f08b-4c10-affc-ec4852bb2c0c',
			userGroup: 'Subscriber',
			profiles: [
				{
					id: '933781',
					segments: 'all'
				}
			],
			accountSegments: 'all',
			isTrialPeriod: false,
			locale: 'en-GB',
			subscriptions: [
				{
					endDate: new Date('2020-06-11T07:45:28.000Z'),
					planId: '10896',
					startDate: new Date('2020-06-09T23:44:55.000Z'),
					code: '193344',
					isTrialPeriod: false,
					status: 'Active'
				},
				{
					code: 'Registered',
					startDate: new Date('1970-01-01T00:00:00.000Z'),
					isTrialPeriod: false,
					planId: 'Registered',
					status: 'Active'
				}
			],
			usedTrialPeriod: false,
			planId: '40148',
			planTitle: 'HBO GO',
			planType: 'Subscription',
			referenceId: 444066
		};

		expect(populateLotameUserData(lotameData, mockRegisteredUser)).to.deep.equal({
			ClientID: '5799',
			AudienceClientID: '5225',
			seg: [
				'PageName:sg:mewatch:online:watch:20130327:230720_Start Up ! 创 ! - S1E2',
				'MediaInfo:mewatch:230720:30:F:340:NA:ZH:NA:2:NA:M:MediaCorp:NA:RO|DR',
				'DeviceType:mewatch:online',
				'DeviceOS:mewatch:web',
				'Section:mewatch:Section:watch',
				'ContentType:mewatch:Video',
				'ContentLanguage:mewatch:ZH',
				'ContentTitle:mewatch:230720:Start Up ! 创 ! - S1E2',
				'MediaChannel:mewatch:Video:NA',
				'VideoGenre:mewatch:Video:Genre:RO|DR',
				'VideoSeriesName:mewatch:Video:Start Up ! 创 !',
				'DomainName:mewatch.sg',
				'UserType:mewatch:UserType:Paid|10896',
				'LoggedInStatus:mewatch:LoggedIn:True',
				'Location:mewatch:sg'
			]
		});
	});

	it("Should populate data for users who are logged in and don't have a subscription", () => {
		const mockRegisteredUser: UserContext = {
			clientId: '94cf5739-04e7-4d32-a48a-8fa69a4b49c5',
			userId: 'b0eae272-f08b-4c10-affc-ec4852bb2c0c',
			userGroup: 'Subscriber',
			profiles: [
				{
					id: '933781',
					segments: 'all'
				}
			],
			accountSegments: 'all',
			isTrialPeriod: false,
			locale: 'en-GB',
			subscriptions: [
				{
					code: 'Registered',
					startDate: new Date('1970-01-01T00:00:00.000Z'),
					isTrialPeriod: false,
					planId: 'Registered',
					status: 'Active'
				}
			],
			usedTrialPeriod: false,
			planId: '40148',
			planTitle: 'HBO GO',
			planType: 'Subscription',
			referenceId: 444066
		};

		expect(populateLotameUserData(lotameData, mockRegisteredUser)).to.deep.equal({
			ClientID: '5799',
			AudienceClientID: '5225',
			seg: [
				'PageName:sg:mewatch:online:watch:20130327:230720_Start Up ! 创 ! - S1E2',
				'MediaInfo:mewatch:230720:30:F:340:NA:ZH:NA:2:NA:M:MediaCorp:NA:RO|DR',
				'DeviceType:mewatch:online',
				'DeviceOS:mewatch:web',
				'Section:mewatch:Section:watch',
				'ContentType:mewatch:Video',
				'ContentLanguage:mewatch:ZH',
				'ContentTitle:mewatch:230720:Start Up ! 创 ! - S1E2',
				'MediaChannel:mewatch:Video:NA',
				'VideoGenre:mewatch:Video:Genre:RO|DR',
				'VideoSeriesName:mewatch:Video:Start Up ! 创 !',
				'DomainName:mewatch.sg',
				'UserType:mewatch:UserType:Free',
				'LoggedInStatus:mewatch:LoggedIn:True',
				'Location:mewatch:sg'
			]
		});
	});
});
