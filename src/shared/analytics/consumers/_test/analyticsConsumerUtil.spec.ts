import { expect } from 'chai';

describe('placeholder', () => {
	it('is a placeholder', () => {
		expect(true).to.be.true;
	});
});

/*
import {
	mockGeneralEvent,
	mockGeneralMcDataLayer,
	mockItemDetailEvent,
	mockItemMcDataLayer,
	mockMediaInfo
} from './dtmAnaliticsConsumerSpecUtil';
import { PageDataTag, MEDIA_GROUP, MEDIA_RIGHTS } from '../analyticsConsumersUtil';
import { expect } from 'chai';

describe('PageDataTag core & utility helpers', () => {
	describe('getting language code', () => {
		it('should match the DTM language syntax', () => {
			const generalEventTest = PageDataTag.getLanguage(mockGeneralEvent.context.user.locale);
			const itemDetailEventTest = PageDataTag.getLanguage(mockItemDetailEvent.context.user.locale);
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.language);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.language);
		});
	});
	describe('getting channel', () => {
		it('should match the DTM channel syntax', () => {
			const generalEventTest = PageDataTag.getChannel();
			const itemDetailEventTest = PageDataTag.getChannel();
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.channel);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.channel);
		});
	});
	describe(`checking user's registration status`, () => {
		it(`should match the DTM user's logged in status`, () => {
			const generalEventTest = PageDataTag.isRegisteredUser(mockGeneralEvent.context.user);
			const itemDetailEventTest = PageDataTag.isRegisteredUser(mockItemDetailEvent.context.user);
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.loggedinstatus);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.loggedinstatus);
		});
	});
	describe('getting the single sign on id', () => {
		it('should match the DTM single sign on (SSO) id syntax', () => {
			const generalEventTest = PageDataTag.getSSOId(mockGeneralEvent.context.user);
			const itemDetailEventTest = PageDataTag.getSSOId(mockItemDetailEvent.context.user);
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.ssoid);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.ssoid);
		});
	});
	describe('getting the login source', () => {
		it(`should match the DTM user's logged in status`, () => {
			const generalEventTest = PageDataTag.getLoginSource(mockGeneralEvent.context.user);
			const itemDetailEventTest = PageDataTag.getLoginSource(mockItemDetailEvent.context.user);
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.loginsource);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.loginsource);
		});
	});
	describe('getting the user type', () => {
		it(`should match the DTM user's usertype syntax`, () => {
			const generalEventTest = PageDataTag.getUserType(mockGeneralEvent.context.user);
			const itemDetailEventTest = PageDataTag.getUserType(mockItemDetailEvent.context.user);
			expect(generalEventTest).to.equal(mockGeneralMcDataLayer.usertype);
			expect(itemDetailEventTest).to.equal(mockItemMcDataLayer.usertype);
		});
	});
	describe('getting the item categories', () => {
		it('should match the DTM abreviated codes syntax for every matching category', () => {
			const itemDetailMediaRights = PageDataTag.getCategories(mockItemDetailEvent.context.item.categories, MEDIA_GROUP);
			const itemDetailMediaGroup = PageDataTag.getCategories(mockItemDetailEvent.context.item.categories, MEDIA_RIGHTS);
			expect(itemDetailMediaRights).to.equal(mockMediaInfo.mediaRights);
			expect(itemDetailMediaGroup).to.equal(mockMediaInfo.mediaGroup);
		});
	});
	describe('getting the media info object', () => {
		it('should match the DTM MediaInfo object', () => {
			const itemDetailEventTest = PageDataTag.getMediaInfoObject(
				mockItemDetailEvent.context.item,
				mockItemDetailEvent.context.user
			);
			expect(itemDetailEventTest).to.deep.equal(mockMediaInfo);
		});
	});
});

	*/
