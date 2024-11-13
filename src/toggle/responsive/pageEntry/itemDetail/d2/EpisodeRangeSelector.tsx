import * as React from 'react';
import { connect } from 'react-redux';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import * as cx from 'classnames';
import Select, { selectBem } from 'toggle/responsive/component/select/Select';
import JumpToEpisodeModal, { JumpToEpisodeModalOwnProps } from './JumpToEpisodeModal';
import { EpisodeRange } from '../../utils/episodeRange';
import { OpenModal } from 'shared/uiLayer/uiLayerWorkflow';
import ModalTypes from 'shared/uiLayer/modalTypes';

const JUMP_TO_EPISODE_MODAL_ID = 'jump-to-episode';
export const EPISODES_PER_OPTION = 24;
export const RANGE_OPTION_ALL = '@{itemDetail_episode_range_option_all}';

interface EpisodeRangeSelectorOwnProps extends React.Props<any> {
	onRangeChange: (range: EpisodeRange) => void;
	episodesAmount: number;
	options: EpisodeRange[];
	setActiveSelector: () => void;
	isActive: boolean;
	itemId: string;
	activeRange: EpisodeRange;
}

interface EpisodeRangeSelectorDispatchProps extends React.Props<any> {
	showJumpToEpisodeModal: (modal: ModalConfig) => void;
}

type Props = EpisodeRangeSelectorOwnProps & EpisodeRangeSelectorDispatchProps;

interface EpisodeRangeSelectorState {
	activeRange: number;
}

class EpisodeRangeSelector extends React.Component<Props, EpisodeRangeSelectorState> {
	private onOptionClick = activeRange => e => {
		const { onRangeChange, options } = this.props;
		onRangeChange(options[activeRange]);
	};

	private onJumpToEpisodeClick = e => {
		const props: JumpToEpisodeModalOwnProps = {
			itemId: this.props.itemId,
			id: JUMP_TO_EPISODE_MODAL_ID
		};

		this.props.showJumpToEpisodeModal({
			id: JUMP_TO_EPISODE_MODAL_ID,
			type: ModalTypes.CUSTOM,
			element: <JumpToEpisodeModal {...props} />
		});
	};

	private checkAllOption = (key: string): boolean => key === RANGE_OPTION_ALL;

	render() {
		const { episodesAmount, options, setActiveSelector, isActive } = this.props;

		if (episodesAmount < EPISODES_PER_OPTION) return false;

		const { activeRange } = this.props;
		const activeIndex = options.findIndex(x => x.key === activeRange.key);

		const items: React.ReactElement<any>[] = options.map(this.renderItem);
		items.splice(1, 0, this.renderJumpToEpisode());

		const isAllOption = this.checkAllOption(options[activeIndex] && options[activeIndex].key);
		const keyValues = { range: options[activeIndex] && options[activeIndex].key };

		const key = isAllOption
			? '@{itemDetail_episode_range_label_all|All Episodes}'
			: '@{itemDetail_episode_range_label|EP: {range}}';

		return (
			<Select
				className={selectBem.b('episode')}
				autoExpand={false}
				labelValues={keyValues}
				label={key}
				options={items}
				extendable={true}
				setActiveSelector={setActiveSelector}
				isActive={isActive}
			/>
		);
	}

	private renderItem = (option, index) => {
		const { activeRange, options } = this.props;
		const activeIndex = options.findIndex(x => x.key === activeRange.key);
		const itemClasses: string = cx(
			selectBem.e('item', {
				active: activeIndex === index
			})
		);

		const isAllOption = this.checkAllOption(option.key);
		const keyValue = isAllOption ? RANGE_OPTION_ALL : option.key;

		return (
			<li key={keyValue} className={itemClasses} onClick={this.onOptionClick(index)}>
				{isAllOption ? <IntlFormatter elementType="span">{RANGE_OPTION_ALL}</IntlFormatter> : keyValue}
			</li>
		);
	};

	private renderJumpToEpisode() {
		return (
			<li key="jump_to_episode" className={selectBem.e('item')} onClick={this.onJumpToEpisodeClick}>
				<IntlFormatter elementType="span">
					{`@{itemDetail_episode_range_jump_to_episode|Jump to Episode}`}
				</IntlFormatter>
			</li>
		);
	}
}
function mapDispatchToProps(dispatch) {
	return {
		showJumpToEpisodeModal: (modal: ModalConfig) => dispatch(OpenModal(modal))
	};
}

export default connect<{}, EpisodeRangeSelectorDispatchProps, EpisodeRangeSelectorOwnProps>(
	undefined,
	mapDispatchToProps
)(EpisodeRangeSelector);
