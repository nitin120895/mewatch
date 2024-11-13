import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import RatingButton from 'ref/tv/pageEntry/itemDetail/dh1/components/RatingButton';
import IntlFormatter from 'ref/tv/component/IntlFormatter';
import { getUserRating } from 'shared/account/profileUtil';
import './PlayerActions.scss';

const bem = new Bem('player-actions');

interface PlayerActionsProps {
	classNames?: string;
	isPIP?: boolean;
	focused?: boolean;
	item: api.ItemSummary;
	activeProfile: api.ProfileDetail;
	click: (act: 'detail' | 'rate' | 'replay' | 'backHome') => void;
	mouseEnter: () => void;
}

interface PlayerActionsState {
	focusState: 'detail' | 'rate' | 'replay' | 'backHome';
}

export default class PlayerActions extends React.Component<PlayerActionsProps, PlayerActionsState> {
	constructor(props) {
		super(props);

		this.state = {
			focusState: 'detail'
		};
	}

	componentWillReceiveProps(nextProps: PlayerActionsProps) {
		const { focusState } = this.state;

		if (nextProps.isPIP) {
			if (focusState === 'detail') {
				this.setState({ focusState: 'rate' });
			}
		} else {
			if (focusState !== 'detail') {
				this.setState({ focusState: 'detail' });
			}
		}
	}

	render() {
		const { focused, classNames, isPIP, item, activeProfile, mouseEnter } = this.props;
		const { focusState } = this.state;
		const itemId = item.showId || item.id;
		const userRating = activeProfile && getUserRating(itemId);
		const rating = (userRating && userRating.value) || undefined;

		return (
			<div className={cx(bem.b(), classNames)} onMouseEnter={mouseEnter}>
				{!isPIP && (
					<IntlFormatter
						tagName="button"
						className={cx(bem.e('detail'), 'action', focused && focusState === 'detail' ? 'focused' : '')}
						onClick={this.invokeItem}
						onMouseEnter={() => this.btnMouseEnter('detail')}
					>
						{`@{player_actions_details|Details}`}
					</IntlFormatter>
				)}

				{isPIP && (
					<div>
						<div
							className={cx(
								bem.e('rate', { noRated: !rating }),
								'action',
								focused && focusState === 'rate' ? 'focused' : ''
							)}
						>
							<RatingButton rating={rating} onClick={this.invokeItem} onMouseEnter={() => this.btnMouseEnter('rate')} />
						</div>
						<IntlFormatter
							tagName="button"
							className={cx(bem.e('replay'), 'action', focused && focusState === 'replay' ? 'focused' : '')}
							onClick={this.invokeItem}
							onMouseEnter={() => this.btnMouseEnter('replay')}
						>
							{`@{player_actions_replay|Replay}`}
						</IntlFormatter>
						<IntlFormatter
							tagName="button"
							className={cx(bem.e('back-home'), 'action', focused && focusState === 'backHome' ? 'focused' : '')}
							onClick={this.invokeItem}
							onMouseEnter={() => this.btnMouseEnter('backHome')}
						>
							{`@{player_actions_back_home|Back to home}`}
						</IntlFormatter>
					</div>
				)}
			</div>
		);
	}

	private btnMouseEnter = (focusState: 'detail' | 'rate' | 'replay' | 'backHome') => {
		this.setState({ focusState: focusState });
	};

	moveLeft = () => {
		const { isPIP } = this.props;
		const { focusState } = this.state;

		if (isPIP) {
			switch (focusState) {
				case 'rate':
					return false;
				case 'replay':
					this.setState({ focusState: 'rate' });
					return true;
				case 'backHome':
					this.setState({ focusState: 'replay' });
					return true;
				default:
					break;
			}
		}
	};

	moveRight = () => {
		const { isPIP } = this.props;
		const { focusState } = this.state;

		if (isPIP) {
			switch (focusState) {
				case 'rate':
					this.setState({ focusState: 'replay' });
					return true;
				case 'replay':
					this.setState({ focusState: 'backHome' });
					return true;
				case 'backHome':
					return false;
				default:
					break;
			}
		}
	};

	invokeItem = () => {
		const { focusState } = this.state;
		this.props.click && this.props.click(focusState);
	};
}
