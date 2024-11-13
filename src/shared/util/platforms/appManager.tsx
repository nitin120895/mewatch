// Application manager for functional app states implementation: native device OS communication, network checking etc.
import * as React from 'react';
import * as PropTypes from 'prop-types';
import DeviceModel from './deviceModel';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import KeysModel from 'shared/util/platforms/keysModel';

export const minKeydownInterval = 200;

export default class AppManager extends React.PureComponent<{}, {}> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes = {
		focusNav: PropTypes.object.isRequired
	};

	private keyDownTime = 1;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		DeviceModel.init();

		if (document && document.body) {
			document.body.addEventListener('keydown', this.onKeyDown, false);
			document.body.addEventListener('mousemove', this.onMouseMove, false);
		}

		document && document.addEventListener('keyboardStateChange', this.onKeyboardVisibilityChange, false);
	}

	componentWillUnmount() {
		if (document && document.body) {
			document.body.removeEventListener('keydown', this.onKeyDown, false);
			document.body.removeEventListener('mousemove', this.onMouseMove, false);
		}

		document && document.removeEventListener('keyboardStateChange', this.onKeyboardVisibilityChange, false);
	}

	render() {
		return <span />;
	}

	private onKeyDown = e => {
		const keyCode = KeysModel.mapKeys(e.keyCode);
		const isDirectionKeyCode =
			keyCode === KeysModel.Left ||
			keyCode === KeysModel.Right ||
			keyCode === KeysModel.Up ||
			keyCode === KeysModel.Down;
		const now = Date.now();
		const { focusNav } = this.context;

		if (focusNav.mouseActive) focusNav.mouseModeActive(false);

		if (isDirectionKeyCode) {
			// at least 200 milliseconds between two operations
			if (now - this.keyDownTime > minKeydownInterval) {
				this.keyDownTime = now;
				focusNav.handleInput(e);
			} else {
				e.preventDefault();
			}
		} else {
			this.keyDownTime = now;
			focusNav.handleInput(e);
		}
	};

	private onMouseMove = e => {
		const mouseSupport = DeviceModel.hasMouseSupport();
		const { focusNav } = this.context;

		if (mouseSupport && !focusNav.mouseActive) {
			focusNav.mouseModeActive(true);
		} else {
			e.preventDefault();
		}
	};

	private onKeyboardVisibilityChange = e => {
		let visibility = !!e.detail.visibility;
		this.context.focusNav.onKeyboardVisibilityChange(visibility);
	};
}
