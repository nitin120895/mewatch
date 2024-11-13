import * as React from 'react';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { get } from 'shared/util/objects';
import { buildSlotId, getDataJsOptions } from '../pageEntry/advertising/adsUtils';
import { getRegisteredProfileInfo } from 'shared/account/profileUtil';
import { ChannelDetail } from 'shared/page/pageTemplate';
import { getUserContext } from 'shared/analytics/getContext';
import { GamVideoAnalyticsData, getAnalyticsData } from 'shared/analytics/api/video';
import * as cx from 'classnames';

const bem = new Bem('ad-banner');
const advertisementContainerClass = 'advertisement-container';

export interface OwnProps {
	textAdFormat: string;
	adCommaDelimitedTags?: string;
	kidsContent?: boolean;
	location: HistoryLocation;
	isPausedAd?: boolean;
	gam?: GamVideoAnalyticsData;
	language?: string;
	adUnitOverride?: string;
}

export interface StateProps {
	profile?: api.ProfileSummary;
	account?: api.Account;
	dfpNetworkCode?: string;
	pageTemplate?: string;
	plans?: api.Plan[];
	item?: api.ItemDetail;
}

type Props = OwnProps & StateProps;

interface State {
	loadingMetaData: boolean;
}

class AdBanner extends React.PureComponent<Props, State> {
	private dataJsOptions;

	state = {
		loadingMetaData: true
	};

	mapAnalyticsData(data) {
		return {
			medialanguage: data.medialanguage,
			mediarights: data.mediarights,
			genre1: data.genre1,
			genre2: data.genre2,
			genre3: data.genre3,
			mediaid: data.mediaid,
			seriestitle: data.seriestitle,
			seriesid: data.seriesid,
			mediatitle: data.mediatitle,
			noadflag: data.noadflag,
			profiletype: 'NA',
			kidscontent: 'NA',
			product: data.product
		};
	}

	componentDidMount() {
		const {
			dfpNetworkCode,
			profile,
			account,
			textAdFormat,
			adCommaDelimitedTags,
			kidsContent,
			location,
			pageTemplate,
			plans,
			item,
			isPausedAd,
			gam,
			language,
			adUnitOverride
		} = this.props;

		// Base implementation for most pages that do not have a video + banner ad
		this.dataJsOptions = getDataJsOptions(
			location,
			profile,
			account,
			item,
			gam,
			language,
			textAdFormat,
			adCommaDelimitedTags,
			kidsContent,
			dfpNetworkCode,
			isPausedAd,
			adUnitOverride
		);

		if (pageTemplate === ChannelDetail && item !== undefined) {
			this.setState({ loadingMetaData: true }, async () => {
				const startingData = JSON.parse(this.dataJsOptions);
				const segments = profile && profile.segments !== undefined ? profile.segments : [];
				const userContextParams = { info: account, segments, plans };
				const AnalyticsData = await getAnalyticsData(getUserContext(userContextParams), {
					mediaId: item.customId,
					pageTemplate
				});

				const videoMetaData = this.mapAnalyticsData(AnalyticsData.gam);

				this.dataJsOptions = JSON.stringify({
					...startingData,
					videoMetaData
				});

				this.setState({ loadingMetaData: false });
			});
		} else {
			this.setState({ loadingMetaData: false });
		}
	}

	render() {
		if (this.state.loadingMetaData) return <div />;

		const { textAdFormat } = this.props;
		const id = buildSlotId(textAdFormat);

		return (
			<div className={bem.b()}>
				<div
					className={cx(bem.e('container'), advertisementContainerClass)}
					id={id}
					data-js-options={this.dataJsOptions}
				/>
			</div>
		);
	}
}

const mapStateToProps = ({ app, account, profile, page }: state.Root): StateProps => ({
	account: account && account.info,
	profile: account.active && getRegisteredProfileInfo(profile),
	dfpNetworkCode: (get(app, 'config.advertisment.adsNetworkCode') || '').toString(),
	pageTemplate: page.history.pageSummary.template,
	plans: (app.config && app.config.subscription && app.config.subscription.plans) || []
});

export default connect<StateProps, {}, Props>(
	mapStateToProps,
	undefined
)(AdBanner);
