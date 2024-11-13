import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import PageScroll from 'ref/responsive/util/PageScroll';
import { isTrailer } from 'toggle/responsive/util/item';
import { wrapPackshot } from 'shared/analytics/components/ItemWrapper';
import { Bem } from 'shared/util/styles';
import { get } from 'shared/util/objects';
import { getItem } from 'shared/service/action/content';
import { getActiveProfile } from 'shared/account/accountUtil';
import { isRatingGreaterOrEqual } from 'shared/app/playerWorkflow';
import { Xh2Autoplay as template } from 'shared/page/pageEntryTemplate';
import Badge from 'toggle/responsive/component/Badge';
import PlayerStandard from '../../player/PlayerStandard';
import ArrowDownIcon from '../../component/ArrowDownIcon';

import './Xh2Autoplay.scss';

const bemXh2Autoplay = new Bem('xh2-autoplay');

interface Xh2AutoplayState {
	trailerItem: api.ItemSummary;
}

interface OwnProps extends PageEntryItemProps {
	getItemInfo: (id: string) => Promise<any>;
}

interface StateProps {
	classification: api.Classification;
}

type Xh2AutoplayProps = OwnProps & StateProps;

class Xh2Autoplay extends React.Component<Xh2AutoplayProps, Xh2AutoplayState> {
	state = {
		trailerItem: undefined
	};

	componentWillMount() {
		const { getItemInfo, item } = this.props;

		if (!item) return;

		if (isTrailer(item)) {
			this.setState({ trailerItem: item });
		} else {
			getItemInfo(item.id).then(itemDetails => {
				const trailers = itemDetails.payload.trailers;
				if (trailers && trailers[0]) {
					getItemInfo(trailers[0].id).then(trailerDetails => this.setState({ trailerItem: trailerDetails.payload }));
				}
			});
		}
	}

	render() {
		const { id, item } = this.props;
		const { trailerItem } = this.state;
		if (trailerItem) {
			trailerItem.path = item.path;
			trailerItem.images = item.images;
		}

		return (
			<div className={cx(bemXh2Autoplay.b(), 'full-bleed')}>
				<div className={bemXh2Autoplay.e('icon-wrapper')}>
					<button onClick={this.scrollDown}>
						<ArrowDownIcon className={bemXh2Autoplay.e('icon')} />
					</button>
				</div>
				<PlayerStandard id={id} item={trailerItem} noUiControls autoplayHero={this.canAutoplayHeroVideo()} />

				{trailerItem && (
					<div className={bemXh2Autoplay.e('overlay')}>
						{this.renderBadge()}
						<h1 className={bemXh2Autoplay.e('title')}>{item.title}</h1>
					</div>
				)}
			</div>
		);
	}

	private renderBadge() {
		const { item } = this.props;

		return item.badge && <Badge item={item} className={bemXh2Autoplay.e('badge')} mod="xh2" />;
	}

	private scrollDown = () => {
		const pageScroller = new PageScroll({
			duration: 50,
			scrollType: 'scrollTop',
			element: [document.body, document.documentElement]
		});
		const container: HTMLElement = findDOMNode(this);
		pageScroller.scroll(container.offsetHeight, document.body.scrollTop || document.documentElement.scrollTop);
	};

	private canAutoplayHeroVideo = () => {
		const { classification, item } = this.props;
		const minUserRating = get(getActiveProfile(), 'minRatingPlaybackGuard.code');
		const contentRating = get(item, 'classification.code');

		return !isRatingGreaterOrEqual(classification, contentRating, minUserRating);
	};
}

function mapStateToProps(state: state.Root): StateProps {
	return {
		classification: get(state, 'app.config.classification')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		getItemInfo: (id: string) => dispatch(getItem(id))
	};
}

const Component: any = connect<StateProps, Xh2AutoplayProps, any>(
	mapStateToProps,
	mapDispatchToProps
)(wrapPackshot(Xh2Autoplay));
Component.template = template;

export default Component;
