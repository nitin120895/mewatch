import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import { getItem } from 'shared/service/content';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import './PlayerInfo.scss';

interface PlayerInfoProps extends React.Props<any> {
	classNames?: string;
	item: api.ItemDetail;
	isPIP?: boolean;
	setTargetItem: (item: api.ItemDetail) => void;
}

const bem = new Bem('player-info');

type PlayerInfoStateProps = Partial<{
	itemDetailCache: { [id: string]: state.ItemDetailCache };
}>;

interface PlayerInfoState {
	title: string;
}

class PlayerInfo extends React.Component<PlayerInfoProps & PlayerInfoStateProps, PlayerInfoState> {
	constructor(props) {
		super(props);

		this.state = {
			title: undefined
		};
	}

	componentDidMount() {
		this.getDetailInfo();
	}

	private getDetailInfo = () => {
		const { itemDetailCache, item, setTargetItem } = this.props;
		const { showId } = item;

		if (!showId) {
			setTargetItem(item);
			return;
		}

		const showItem = itemDetailCache[showId];

		if (!showItem) {
			getItem(showId, { expand: 'children' })
				.then(results => {
					if (!results.error) {
						setTargetItem(results.data);
						this.setState({ title: results.data.title });
					}
				})
				.catch(res => {
					setTargetItem(item);
					this.setState({ title: item.title });
				});
		} else {
			setTargetItem(showItem.item);
			this.setState({ title: showItem.item.title });
		}
	};

	render() {
		const classes = cx(bem.b(), this.props.classNames);
		const { item, isPIP } = this.props;
		const subTitle = item.episodeName || item.title;
		const desc = item.shortDescription;
		const isShowSubTitle = item.type === 'episode';

		return (
			<div className={classes}>
				<div className={bem.e('title')}>{item.showId ? this.state.title : item.title}</div>
				{isShowSubTitle && (
					<IntlFormatter
						tagName="div"
						className={bem.e('sub-title', { show: !!subTitle && !isPIP })}
						values={{
							seasonNumber: (item.season && item.season.seasonNumber) || item.seasonNumber,
							episodeNumber: item.episodeNumber,
							episodeName: subTitle
						}}
					>
						{`@{player_actions_metadata_title|S{seasonNumber} E{episodeNumber} - {episodeName}}`}
					</IntlFormatter>
				)}
				<div className={bem.e('desc', { show: !isPIP })}>{desc}</div>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root): PlayerInfoStateProps {
	return {
		itemDetailCache: state.cache.itemDetail
	};
}

function mapDispatchToProps(dispatch: any): any {
	return {};
}

export default connect<PlayerInfoStateProps, any, PlayerInfoProps>(
	mapStateToProps,
	mapDispatchToProps,
	undefined,
	{
		withRef: true
	}
)(PlayerInfo);
