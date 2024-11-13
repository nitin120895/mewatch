import * as React from 'react';
import ConfirmationDialog from 'ref/responsive/component/dialog/ConfirmationDialog';
import * as cx from 'classnames';
import { Bem } from 'shared/util/styles';

import './ConfirmationDialogComponents.scss';

interface State {
	title?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: boolean;
	onCancel?: boolean;
	content?: string;
	clickMessage?: string;
}

const bem = new Bem('confirmation-dialog-component');

export default class ConfirmationDialogComponents extends React.Component<any, State> {
	messageTimeout: number;
	state = {
		title: 'A test title',
		onConfirm: true,
		onCancel: true,
		cancelLabel: 'Cancel',
		confirmLabel: 'Confirm',
		content: "Lorem ipsum I don't remember the rest. This is some default content",
		clickMessage: undefined
	};

	private onConfirmButtonChange = () => {
		this.setState({ onConfirm: !this.state.onConfirm });
	};

	private onCancelButtonChange = () => {
		this.setState({ onCancel: !this.state.onCancel });
	};

	private onButtonClick = buttonType => {
		window.clearTimeout(this.messageTimeout);
		this.setState({ clickMessage: `${buttonType} was clicked at ${new Date().toTimeString()}.` });
		this.messageTimeout = window.setTimeout(() => {
			this.setState({ clickMessage: '' });
		}, 5000);
	};

	private onTextChange = (valName: string, newVal: any) => {
		this.setState({ [valName]: newVal });
	};

	render() {
		const { onConfirm, onCancel, title, cancelLabel, confirmLabel, content, clickMessage } = this.state;

		return (
			<div className={bem.b()}>
				<form className={bem.e('modifications')}>
					<h4>Confirmation Modal Options</h4>
					<div className="row form-group">
						<div className="col col-phone-8 col-tablet-6 col-desktop-4">
							<label className="label-inline" htmlFor="title">
								Title
							</label>
						</div>
						<div className="col col-phone-16 col-tablet-18 col-desktop-10">
							<input
								type="text"
								value={title}
								id="title"
								name="title"
								onChange={e => this.onTextChange('title', e.target.value)}
							/>
						</div>
					</div>
					<div className="row form-group">
						<div className="col col-phone-8 col-tablet-6 col-desktop-4">
							<label>Confirm Label</label>
						</div>
						<div className="col col-phone-16 col-tablet-18 col-desktop-10">
							<input
								type="text"
								value={confirmLabel}
								name="confirmlabel"
								onChange={e => this.onTextChange('confirmLabel', e.target.value)}
							/>
						</div>
					</div>
					<div className="row form-group">
						<div className="col col-phone-8 col-tablet-6 col-desktop-4">
							<label>Cancel Label</label>
						</div>
						<div className="col col-phone-16 col-tablet-18 col-desktop-10">
							<input
								type="text"
								value={cancelLabel}
								name="cancellabel"
								onChange={e => this.onTextChange('cancelLabel', e.target.value)}
							/>
						</div>
					</div>
					<label>Confirmation Content</label>
					<textarea
						name="content"
						id="content"
						cols={30}
						rows={5}
						value={content}
						onChange={e => this.onTextChange('content', e.target.value)}
					/>
					<div className={cx('form-group', bem.e('buttons'))}>
						<div>
							<input
								id="onconfirm"
								type="checkbox"
								checked={onConfirm}
								onChange={this.onConfirmButtonChange}
								name="onconfirm"
							/>
							<label htmlFor="onconfirm">Show Confirm button</label>
						</div>
						<div>
							<input
								id="oncancel"
								type="checkbox"
								checked={onCancel}
								onChange={this.onCancelButtonChange}
								name="oncancel"
							/>
							<label htmlFor="oncancel">Show Cancel Button</label>
						</div>
					</div>
				</form>
				<hr />
				<div className={bem.e('dialog')}>
					<div className={bem.e('message-container')}>
						<div className={bem.e('message', clickMessage ? 'visible' : 'hidden')}>{clickMessage}</div>
					</div>
					<ConfirmationDialog
						title={title}
						confirmLabel={confirmLabel}
						cancelLabel={cancelLabel}
						onClose={() => this.onButtonClick('Close')}
						onConfirm={onConfirm ? () => this.onButtonClick('Confirm') : undefined}
						onCancel={onCancel ? () => this.onButtonClick('Cancel') : undefined}
					>
						{content}
					</ConfirmationDialog>
				</div>
			</div>
		);
	}
}
