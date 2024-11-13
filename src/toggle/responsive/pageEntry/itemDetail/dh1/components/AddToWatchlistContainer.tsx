import * as React from 'react';
import { connect } from 'react-redux';

import { getItem as getLocalStorageItem, setItem as setLocalStorageItem } from 'shared/util/localStorage';
import { get } from 'shared/util/objects';
import { Bem } from 'shared/util/styles';

import AddToWatchlist, {
	WatchlistButtonProps
} from 'toggle/responsive/pageEntry/itemDetail/dh1/components/AddToWatchlist';
import PopOver from 'toggle/responsive/pageEntry/itemDetail/dh1/components/PopOver';
import PopOverOverlay from 'toggle/responsive/pageEntry/itemDetail/dh1/components/PopOverOverlay';

import './AddToWatchlistContainer.scss';

interface OwnProps extends WatchlistButtonProps {}

interface StateProps {
	isAddToListNudgeEnable?: boolean;
	profile?: state.Profile;
	isSignedIn?: boolean;
}

type AddToWatchlistContainerProps = StateProps & OwnProps;

interface AddToWatchlistContainerState {
	isShowPopOver?: boolean;
}

const IDP_NUDGE_SHOWN = 'idpNudgeShown';

const bem = new Bem('add-to-watchlist-container');

export class AddToWatchlistContainer extends React.Component<
	AddToWatchlistContainerProps,
	AddToWatchlistContainerState
> {
	private container: HTMLElement;

	constructor(props) {
		super(props);
		this.state = {
			isShowPopOver: false
		};
	}

	componentDidMount() {
		this.setShowNudge();
	}

	render() {
		const { isShowPopOver } = this.state;
		const { addedToWatchlist, className } = this.props;
		return (
			<div ref={this.onContainerRef} className={bem.b()}>
				<AddToWatchlist
					addedToWatchlist={addedToWatchlist}
					onClick={this.onAddToWatchlistClick}
					className={className}
				/>
				{isShowPopOver && this.renderMyListNudge()}
			</div>
		);
	}

	private onContainerRef = (ref: HTMLElement) => {
		this.container = ref;
	};

	private renderMyListNudge = () => {
		const addToMyListButtonBottomSpace = this.getComponentPosition() || 0;
		const nudgePositionIdentifier = addToMyListButtonBottomSpace < 115 && addToMyListButtonBottomSpace > -10;
		const nudgePosition = nudgePositionIdentifier ? true : false;

		return (
			<PopOverOverlay overlayTopPosition={nudgePosition}>
				<PopOver onClosePopOver={this.onClosePopOver} nudgeTipbottom={nudgePosition} />
			</PopOverOverlay>
		);
	};

	private onClosePopOver = () => {
		const { isShowPopOver } = this.state;
		this.setState({ isShowPopOver: !isShowPopOver });
		setLocalStorageItem(IDP_NUDGE_SHOWN, true);
	};

	private onAddToWatchlistClick = () => {
		const { isSignedIn, onClick } = this.props;
		if (isSignedIn) {
			this.setState({ isShowPopOver: false });
			setLocalStorageItem(IDP_NUDGE_SHOWN, true);
		}
		onClick();
	};

	private setShowNudge = () => {
		const { isAddToListNudgeEnable, isSignedIn, profile } = this.props;
		const { isShowPopOver } = this.state;

		let isMyListEmpty = true; // checking user has an item in my list or not.

		/** If the sign-in user had added the items inside the my list before he
		 *  will not see the nudge.
		 */
		if (isSignedIn) {
			const getBookmark = Object.keys(get(profile, 'info.bookmarked'));
			isMyListEmpty = getBookmark.length === 0;
		}

		const isNudgeClosedBefore = getLocalStorageItem(IDP_NUDGE_SHOWN);
		if (isAddToListNudgeEnable && !isShowPopOver && !isNudgeClosedBefore && isMyListEmpty) {
			this.setState({ isShowPopOver: true });
		}
	};
	private getComponentPosition(position = 'bottom') {
		if (!this.container) return;

		const componentPosition =
			position === 'bottom'
				? this.container.getBoundingClientRect().bottom
				: this.container.getBoundingClientRect().top; // getting the position of element based on position props
		const spacing = window.innerHeight - componentPosition; // calculating the spacing between the element and the bottom/top of the screen
		return spacing;
	}
}

function mapStateToProps(state: state.Root): StateProps {
	const { app, account, profile } = state;
	return {
		isAddToListNudgeEnable: get(app.config, 'general.customFields.FeatureToggle.addToListNudge.web.enabled'),
		isSignedIn: !!account && account.active,
		profile
	};
}

const Component: any = connect<StateProps, undefined, any>(
	mapStateToProps,
	undefined
)(AddToWatchlistContainer);

export default Component;
