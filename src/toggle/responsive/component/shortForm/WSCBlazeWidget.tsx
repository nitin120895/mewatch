import * as React from 'react';
import { connect } from 'react-redux';
import { selectPreviousPagePath } from 'shared/page/pageUtil';
import BlazeSDK from 'toggle/responsive/component/shortForm/BlazeWrapper';

interface OwnProps {
	id: string;
	labels: any;
	orderType?: any;
	contentType?: any;
	theme?: any;
	width?: string;
	height?: string;
	style?: React.CSSProperties;
	onRender?: () => void;
}

interface StoreProps {
	previousPath?: string;
}

interface StateProps {
	storiesCount: any;
}

let isBlazeSDKInitialized = false;

type WSCBlazeSDKProps = OwnProps & StoreProps;
class WSCBlazeSDK extends React.Component<WSCBlazeSDKProps, StateProps> {
	constructor(props: WSCBlazeSDKProps) {
		super(props);
		this.state = {
			storiesCount: []
		};
	}
	private _isMounted = false; // The variable can be accessed and modified within the class methods if created using _
	private widgetView: any;

	componentDidMount() {
		if (!isBlazeSDKInitialized) {
			const apiKey = process.env.CLIENT_WSC_API_KEY;
			BlazeSDK.Initialize(apiKey, {
				sendAnalytics: true
			});
			isBlazeSDKInitialized = true;
		}
		document.addEventListener('onBlazeSDKConnect', this.handleCreateWidget);
		if (this.props.previousPath) this.handleCreateWidget();
		this._isMounted = true;
		BlazeSDK.addDelegateListener(BlazeSDK.Delegations.onWidgetDataLoadCompleted, event => this.totalEnteries(event)); // to find out how many entry has a particular rail.
		BlazeSDK.addDelegateListener(BlazeSDK.Delegations.onStoryPlayerDismissed, () => {
			this.widgetView && this.widgetView.reload();
		});

		BlazeSDK.addDelegateListener(BlazeSDK.Delegations.onEventTriggered, event => {
			if (this.widgetView && event.detail.eventType === 'widget_click') this.widgetView.reload();
		});

		document.addEventListener('visibilitychange', this.handleVisibilityChange);
	}

	componentWillUnmount(): void {
		this._isMounted = false;
		document.removeEventListener('onBlazeSDKConnect', this.handleCreateWidget);
	}

	handleCreateWidget = () => {
		this.createWidget();
	};

	handleVisibilityChange = () => {
		if (!document.hidden) {
			this.widgetView && this.widgetView.reload();
		}
	};

	async createWidget() {
		const { id } = this.props;

		this.widgetView = BlazeSDK.WidgetGridView(id, {
			...this.props
		});
		return this.widgetView;
	}

	render() {
		const { id, width, height } = this.props;
		const storiesCount = this.state.storiesCount.filter(
			entryId => entryId.widgetId.includes(id) && entryId.storyCount > 0
		);

		return (
			<div
				id={id}
				style={{
					width: width || '100%',
					height: height || 'auto',
					display: storiesCount.length === 0 ? 'none' : 'block'
				}}
			/>
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
function mapStateToProps(state: state.Root): StoreProps {
	return {
		previousPath: selectPreviousPagePath(state)
	};
}

export default connect<StoreProps, any, OwnProps>(
	mapStateToProps,
	undefined
)(WSCBlazeSDK);
