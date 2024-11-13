import * as React from 'react';
import IntlFormatter from 'ref/responsive/component/IntlFormatter';
import { Bem } from 'shared/util/styles';
import AccountButton from './input/AccountButton';
import CtaButton from './CtaButton';
import { noop } from 'shared/util/function';
import CreatePin from './CreatePin';

import './CreatePin.scss';

const bem = new Bem('create-pin');

interface CreatePinProps {
	loading: boolean;
	error?: boolean;
	title: string;
	children: string;
	onSubmit?: (pin: string) => void;
	onCancel?: () => void;
}

interface CreatePinState {
	pin: number[];
}

export default class CreatePinForm extends React.Component<CreatePinProps, CreatePinState> {
	static defaultProps = {
		onSubmit: noop,
		onCancel: noop
	};

	state: CreatePinState = {
		pin: []
	};

	private onChange = pin => {
		this.setState({ pin });
	};

	private onSubmit = e => {
		e.preventDefault();
		this.props.onSubmit(this.state.pin.join(''));
	};

	private onCancel = () => {
		this.setState({ pin: [] });
		this.props.onCancel();
	};

	render() {
		const { loading, title, children, error } = this.props;
		const { pin } = this.state;
		return (
			<form className={bem.b()} onSubmit={this.onSubmit}>
				<CreatePin
					disable={loading}
					title={title}
					children={children}
					error={error}
					pin={pin}
					onChange={this.onChange}
				/>
				<div className={bem.e('buttons')}>
					<IntlFormatter
						elementType={AccountButton}
						className={bem.e('button')}
						type={'submit'}
						componentProps={{ loading }}
					>
						{'@{account_common_createPin_button_label|Create PIN}'}
					</IntlFormatter>
					<IntlFormatter
						elementType={CtaButton}
						className={bem.e('button')}
						onClick={this.onCancel}
						componentProps={{
							ordinal: 'naked',
							theme: 'light'
						}}
					>
						{'@{account_common_cancel_button_label|Cancel}'}
					</IntlFormatter>
				</div>
			</form>
		);
	}
}
