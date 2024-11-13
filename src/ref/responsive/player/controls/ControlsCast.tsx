import * as React from 'react';
import * as cx from 'classnames';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';
import CastIcon from './icons/CastIcon';
import { chromecastIntroduction } from 'shared/app/playerWorkflow';
import { showCastIntro } from '../cast/Cast';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';

import './ControlsCast.scss';

interface ControlsCastProps extends React.Props<any> {
	className?: string;
	cast?: state.CastStatus;
	chromecastIntroduction: (show: boolean) => void;
}

const bem = new Bem('cast-control');

class ControlsCast extends React.Component<ControlsCastProps> {
	componentDidMount() {
		this.tryShowIntroduction();
	}

	componentDidUpdate() {
		this.tryShowIntroduction();
	}

	componentWillUnmount() {
		const { cast, chromecastIntroduction } = this.props;
		if (cast.showIntroduction) chromecastIntroduction(false);
	}

	tryShowIntroduction() {
		const { cast, chromecastIntroduction } = this.props;
		if (!cast.showIntroduction && !cast.noDevice && showCastIntro()) {
			chromecastIntroduction(true);
		}
	}

	render() {
		const { cast, className } = this.props;

		let connectionClass = bem.e('disconnected');

		switch (cast.connectionStatus) {
			case 'Connecting':
				connectionClass = bem.e('connecting');
				break;
			case 'Connected':
				connectionClass = bem.e('connected');
				break;
			case 'Disconnected':
				connectionClass = bem.e('disconnected');
				break;
			default:
				connectionClass = bem.e('noDevices');
				break;
		}

		return (
			<div className={cx(className, bem.b())}>
				<IntlFormatter
					elementType="button"
					formattedProps={{ 'aria-label': '@{player_cast|Play on TV}' }}
					id="google-cast-button"
					is="google-cast-button"
					tabIndex={7}
				/>
				<IntlFormatter elementType="button" className={cx('cast-button', connectionClass)} tabIndex={-1}>
					<CastIcon />
				</IntlFormatter>
			</div>
		);
	}
}

function mapStateToProps(state: state.Root) {
	const {
		player: { cast }
	} = state;
	return { cast };
}

function mapDispatchToProps(dispatch) {
	return {
		chromecastIntroduction: (show: boolean) => dispatch(chromecastIntroduction(show))
	};
}

export default connect<any, any, ControlsCastProps>(
	mapStateToProps,
	mapDispatchToProps
)(ControlsCast);
