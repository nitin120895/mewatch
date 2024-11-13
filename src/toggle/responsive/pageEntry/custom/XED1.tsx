// XED1 template used to render the moment and stories form the shortform sdk.
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import BlazeSDK from 'toggle/responsive/component/shortForm/BlazeWrapper';
import { XED1 as template } from 'shared/page/pageEntryTemplate';
import { get } from 'shared/util/objects';
import { createShortFormProps, WidgeType } from 'toggle/responsive/util/shortFormUtil';
import { Bem } from 'shared/util/styles';

import EntryTitle from 'toggle/responsive/component/EntryTitle';
import Moment from 'toggle/responsive/component/shortForm/Moment';
import Story from 'toggle/responsive/component/shortForm/Story';

import './XED1.scss';
interface OwnProps extends PageEntryItemDetailProps {
	className: string;
	item: api.ItemSummary;
}

interface StateProps {
	storiesCount: any;
}

interface StoreProps {
	countryCode: string;
	shortformAllowedCountryCode: string[];
	shortformEnabled: boolean;
}

type ComponentProps = OwnProps & StoreProps;

const bemXed1 = new Bem('xed1');

class XED1 extends React.Component<ComponentProps, StateProps> {
	constructor(props: ComponentProps) {
		super(props);
		this.state = {
			storiesCount: []
		};
	}
	private _isMounted = false; // The variable can be accessed and modified within the class methods if created using _

	componentDidMount(): void {
		this._isMounted = true;
		BlazeSDK.addDelegateListener(BlazeSDK.Delegations.onWidgetDataLoadCompleted, event => this.totalEnteries(event)); // to find out how many entry has a particular rail.
	}

	componentWillUnmount(): void {
		this._isMounted = false;
	}

	render() {
		const { className, id, countryCode, shortformEnabled, shortformAllowedCountryCode } = this.props;

		const isShortformEnabled = shortformEnabled && shortformAllowedCountryCode.includes(countryCode);
		// tslint:disable-next-line: no-null-keyword
		if (!isShortformEnabled) return null;

		const shortFormProps = createShortFormProps(this.props);
		const { widgetType, label } = shortFormProps;

		// tslint:disable-next-line: no-null-keyword
		if (!widgetType || !label) return null;
		const storiesCount = this.state.storiesCount.filter(
			entryId => entryId.widgetId.includes(id) && entryId.storyCount > 0
		);
		const classes = cx('s1', className, bemXed1.b({ 'not-empty': storiesCount.length > 0 }));

		return (
			<div className={classes}>
				{storiesCount.length > 0 && <EntryTitle {...this.props} />}
				{widgetType && widgetType === WidgeType.Moment && <Moment {...this.props} />}
				{widgetType && widgetType === WidgeType.Story && <Story {...this.props} />}
			</div>
		);
	}

	private totalEnteries = event => {
		if (!this.state.storiesCount.includes(event.detail) && this._isMounted) {
			this.setState(prevState => ({
				storiesCount: prevState.storiesCount.concat(event.detail)
			}));
		}
	};
}

function mapStateToProps({ app }: state.Root): StoreProps {
	let allowedCountryCode = get(app, 'config.general.customFields.ShortformAllowedCountryCode');
	if (allowedCountryCode) {
		allowedCountryCode.map(countryCode => countryCode.toLowerCase());
	}
	return {
		countryCode: app.countryCode.toLowerCase(),
		shortformAllowedCountryCode: allowedCountryCode || [],
		shortformEnabled: get(app.config, 'general.customFields.FeatureToggle.shortform.web.enabled')
	};
}

const Component: any = connect<StoreProps, {}, OwnProps>(
	mapStateToProps,
	undefined
)(XED1);
Component.template = template;

export default Component;
