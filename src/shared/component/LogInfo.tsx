import * as React from 'react';
import { Bem } from 'shared/util/styles';
import './LogInfo.scss';

const enableLog = false;

const bem = new Bem('log');

export interface LogEntry {
	level: 'error' | 'warning' | 'normal';
	message: string;
	timestamp: Number;
}

type LogInfoState = {
	messages: LogEntry[];
	show: boolean;
};

let logComponent: LogInfo;
let cache: LogEntry[] = [];

export const logUtil = {
	show: () => {
		if (!enableLog) return;

		logComponent && logComponent.show();
	},
	hide: () => {
		if (!enableLog) return;

		logComponent && logComponent.hide();
	},
	clear: () => {
		if (!enableLog) return;

		logComponent && logComponent.clear();
	},
	normal: message => {
		if (!enableLog) return;

		if (logComponent) logComponent.add(message, 'normal');
		else
			cache.push({
				timestamp: Date.now(),
				level: 'normal',
				message
			});
	},
	warn: message => {
		if (!enableLog) return;

		if (logComponent) logComponent.add(message, 'warning');
		else
			cache.push({
				timestamp: Date.now(),
				level: 'warning',
				message
			});
	},
	error: message => {
		if (!enableLog) return;

		if (logComponent) logComponent.add(message, 'error');
		else
			cache.push({
				timestamp: Date.now(),
				level: 'error',
				message
			});
	}
};

export class LogInfo extends React.Component<any, LogInfoState> {
	constructor(props) {
		super(props);

		this.state = {
			messages: cache,
			show: enableLog
		};

		logComponent = this;
	}

	render() {
		if (!enableLog) return <span />;

		return (
			<div className={bem.b({ show: this.state.show })}>
				<table className={bem.e('table')}>
					<tbody>
						{this.state.messages.map((e, i) => {
							return (
								<tr key={`log-entry-${i}`} className={bem.e('entry', `${e.level}`)}>
									<td className={bem.e('id')}>{i + 1}</td>
									<td className={bem.e('time')}>{e.timestamp}</td>
									<td className={bem.e('message')}>{e.message}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}

	show = () => {
		this.setState({ show: true });
	};

	hide = () => {
		this.setState({ show: false });
	};

	add = (info: string, level) => {
		const { messages } = this.state;

		messages.push({
			timestamp: Date.now(),
			level,
			message: info
		});

		this.setState({ messages });
	};

	clear = () => {
		this.setState({ messages: [] });
	};
}
