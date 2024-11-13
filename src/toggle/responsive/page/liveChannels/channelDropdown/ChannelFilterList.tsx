import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import { XED3 } from 'shared/page/pageEntryTemplate';
import './ChannelFilterList.scss';

interface ChannelFilterListProps {
	channels: api.PageEntry[];
	selectedChannelName: string;
	onSelect: (value: string) => void;
	closeDropdown: (e) => void;
}

export const enum ChannelFilterListLabels {
	ALL_CHANNELS = 'All Channels'
}

const bem = new Bem('channel-filter-list');

export default class ChannelFilterList extends React.Component<ChannelFilterListProps> {
	componentDidMount(): void {
		const { closeDropdown } = this.props;
		document.body.addEventListener('click', closeDropdown);
	}

	componentWillUnmount(): void {
		const { closeDropdown } = this.props;
		document.body.removeEventListener('click', closeDropdown);
	}

	render() {
		let channels = this.props.channels;
		if (!channels || !channels.length) {
			/* tslint:disable-next-line:no-null-keyword */
			return null;
		}
		return this.renderList(channels);
	}

	private renderList = (channels: api.PageEntry[]) => {
		const { selectedChannelName, onSelect } = this.props;
		const active = ChannelFilterListLabels.ALL_CHANNELS === selectedChannelName;
		const classes = cx(bem.e('option', { active }));
		return (
			<ul>
				<li onClick={() => onSelect(ChannelFilterListLabels.ALL_CHANNELS)} className={classes}>
					<a className={bem.e('label')}>{ChannelFilterListLabels.ALL_CHANNELS}</a>
				</li>
				{channels.map(this.renderItem)}
			</ul>
		);
	};

	private renderItem = (channel: api.PageEntry) => {
		const { selectedChannelName, onSelect } = this.props;
		const { id, title, text } = channel;
		const active = title === selectedChannelName;
		const category = channel.template === XED3;
		const className = cx(bem.e('option', { category, active }));
		const tabName = title || text;
		return (
			<li onClick={() => onSelect(tabName)} key={id} className={className}>
				<a className={bem.e('label', { category })}>{tabName}</a>
			</li>
		);
	};
}
