import * as React from 'react';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import SGFlag from 'toggle/responsive/pageEntry/gamesSchedule/SGFlag';

import './TeamSGToggle.scss';

interface Props {
	isToggleOn: boolean;
	onToggle?: () => void;
}

export const bem = new Bem('teamsg-toggle');

export default class TeamSGToggle extends React.Component<Props> {
	render() {
		const { isToggleOn, onToggle } = this.props;
		const toggleClass = isToggleOn && isToggleOn === true ? 'on' : 'off';

		return (
			<button className={bem.b(toggleClass)} onClick={onToggle}>
				<span className={bem.e('slider')} />
				<div className={bem.e('labels')}>
					<span className={cx(bem.e('label'), bem.e('label--off'))}>
						<IntlFormatter className="display-mobile">{'@{games_schedule_all_label_mobile|All}'}</IntlFormatter>
						<IntlFormatter className="display-desktop">{'@{games_schedule_all_label|All Events}'}</IntlFormatter>
					</span>

					<span className={cx(bem.e('label'), bem.e('label--on'))}>
						<div className={bem.e('sg')}>
							<SGFlag className={bem.e('flag')} />
							<IntlFormatter className={cx(bem.e('sg__label'), 'display-desktop')}>
								{'@{games_schedule_sg_label|Team SG Events}'}
							</IntlFormatter>
						</div>
					</span>
				</div>
			</button>
		);
	}
}
