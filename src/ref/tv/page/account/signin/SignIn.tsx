import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SignInModal from 'ref/tv/component/modal/SignInModal';
import { Focusable } from 'ref/tv/focusableInterface';
import { stopMove } from 'ref/tv/util/focusUtil';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import { InjectedIntl } from 'react-intl';
import { REPLACE_PROMPTS, createPrompt } from 'shared/account/sessionWorkflow';
import DeviceModel from 'shared/util/platforms/deviceModel';
import { pollAccountTokenByCode } from 'shared/account/deviceWorkflow';
import ExpiredPromptModal from 'ref/tv/component/modal/CommonMsgModal';

type SignInProps = {
	onBack: () => void;
	onRenew?: () => void;
	isExpiredMode?: boolean;
	needsAction?: boolean;
	code: string;
};

type SignInMapStateProps = {
	websiteUrl: string;
};

type SignInDispatchProps = {
	dispatch: any;
};

type SignInState = Partial<{}>;

class SignIn extends React.PureComponent<SignInProps & SignInMapStateProps & SignInDispatchProps, SignInState> {
	context: {
		intl: InjectedIntl;
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		intl: React.PropTypes.object.isRequired,
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;

	constructor(props) {
		super(props);

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: stopMove,
			moveLeft: stopMove,
			moveRight: stopMove,
			moveUp: stopMove,
			moveDown: stopMove,
			exec: this.exec
		};
	}

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
	}

	private exec = (act?: string): boolean => {
		const { isExpiredMode, needsAction, code, onRenew, dispatch, onBack } = this.props;

		switch (act) {
			case 'click':
				if (isExpiredMode) {
					onRenew();
				} else if (needsAction) {
					const prompt = createPrompt('gencode_ok', ['Catalog']);
					prompt['code'] = code;
					dispatch({ type: REPLACE_PROMPTS, payload: prompt });
					const { getId } = DeviceModel.deviceInfo();
					getId().then(id => {
						pollAccountTokenByCode(dispatch, { id, code }, 2);
					});
				}
				break;

			case 'esc':
				onBack();
				break;

			default:
				break;
		}

		return true;
	};

	private onClick = () => {
		this.exec('click');
	};

	render() {
		const { code, websiteUrl, isExpiredMode, needsAction } = this.props;
		const { formatMessage } = this.context.intl;

		if (isExpiredMode) {
			return (
				<ExpiredPromptModal
					focused={true}
					curIndex={0}
					buttons={[formatMessage({ id: 'signin_request_code' })]}
					title={formatMessage({ id: 'signin_code_expired' })}
					text={''}
					onClick={this.onClick}
				/>
			);
		} else {
			return (
				<SignInModal
					focused={true}
					code={code}
					websiteUrl={websiteUrl}
					needsAction={needsAction}
					onClick={this.onClick}
				/>
			);
		}
	}
}

function mapStateToProps(state: state.Root): SignInMapStateProps {
	const { app } = state;
	const websiteUrl = app.config.general.websiteUrl + '/code';

	return {
		websiteUrl
	};
}

function mapDispatchToProps(dispatch: any): SignInDispatchProps {
	return { dispatch };
}

export default connect<any, SignInDispatchProps, SignInProps>(
	mapStateToProps,
	mapDispatchToProps
)(SignIn);
