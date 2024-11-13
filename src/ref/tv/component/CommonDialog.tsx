import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import * as cx from 'classnames';
import './CommonDialog.scss';
import { CommonDialog } from '../util/CommonDialog';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
const bem = new Bem('common-dialog');

interface GlobalHeaderState {
	children?: any;
	isOpen: boolean;
}

export default class CommonDialogComponent extends React.Component<any, GlobalHeaderState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			isOpen: props.isOpen,
			children: undefined
		};

		CommonDialog.setup(this);
	}

	show(content?: any) {
		const { isOpen, children } = this.state;
		if (isOpen && children) {
			// Cannot show tow dialogs at the same time
			return;
		}

		const child = content || children;

		if (child) {
			this.setState({
				isOpen: true,
				children: child
			});
		}
	}

	hide() {
		const { isOpen } = this.state;
		if (!isOpen) {
			// Dialog has not showed
			return false;
		} else {
			this.setState({
				isOpen: false,
				children: undefined
			});

			return true;
		}
	}

	render() {
		const { isOpen, children } = this.state;

		return (
			<div tabIndex={1} className={cx(bem.b(isOpen ? 'show' : ''))}>
				<div className={bem.e('content')}>{children}</div>
			</div>
		);
	}
}
