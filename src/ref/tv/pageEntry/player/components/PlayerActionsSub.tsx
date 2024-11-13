import * as React from 'react';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import './PlayerActionsSub.scss';

const bem = new Bem('player-actions-sub');

interface PlayerActionsSubProps {
	classNames?: string;
	isEndMode?: boolean;
	focused?: boolean;
	actions: string[];
	selectedItem: String;
	click: (string) => void;
}

interface PlayerActionsSubState {
	focusState: number;
}

export default class PlayerActionsSub extends React.Component<PlayerActionsSubProps, PlayerActionsSubState> {
	constructor(props) {
		super(props);
		this.state = {
			focusState: 0
		};
	}

	render() {
		const focused = this.props.focused;
		const actions = this.props.actions || [];
		const focusState = this.state.focusState;
		const selectedIndex = actions.findIndex(a => a === this.props.selectedItem);
		return (
			<div className={cx(bem.b({ end: this.props.isEndMode }), this.props.classNames)}>
				{actions.map((act, i) => (
					<button
						key={`player-actions-sub-${i}`}
						className={cx(
							bem.e('act'),
							'action',
							focused && focusState === i ? 'focused' : '',
							selectedIndex === i ? 'selected' : ''
						)}
					>
						{act}
					</button>
				))}
			</div>
		);
	}

	moveLeft = () => {
		const focusState = this.state.focusState;
		if (focusState > 0) {
			this.setState({ focusState: focusState - 1 });
		}
	};

	moveRight = () => {
		const focusState = this.state.focusState;
		const maxValue = this.props.actions.length - 1;
		if (focusState < maxValue) {
			this.setState({ focusState: focusState + 1 });
		}
	};

	invokeItem = () => {
		this.props.click(this.props.actions[this.state.focusState]);
	};
}
