import sass from 'ref/tv/util/sass';

export const focusedClass = 'focused';

export function stopMove() {
	return true;
}

export function skipMove() {
	return false;
}

export function stopExec(act?: string): boolean {
	return true;
}

export function cannotFocus(isFocus: boolean) {
	return false;
}

export function getLeftToViewport() {
	return 0;
}

export function setFocus(isFocus: boolean) {
	this.setState && this.setState({ focused: isFocus });
	return true;
}

export function wrapValue(value: number, min: number, max: number, loop = false): number {
	return value < min ? (loop ? max : min) : value > max ? (loop ? min : max) : value;
}

export function transform(
	value: string,
	duration = sass.transitionDuration,
	delay = 0,
	isVertical = false,
	custom: object = undefined,
	notUseTransform = false
) {
	if (_NO_CSS_TRANSITION_) {
		const styleObj = isVertical ? { top: value } : { left: value };
		return Object.assign(styleObj, custom ? custom : {});
	}

	const transformValue = `translate${isVertical ? 'Y' : ''}(${value})`;
	const tempStyle = {
		'transition-duration': duration + 'ms',
		'-webkit-transition-duration': duration + 'ms',
		'transition-delay': delay + 'ms',
		'-webkit-transition-delay': delay + 'ms'
	};
	const styleObj = notUseTransform
		? {
				left: value,
				transitionProperty: 'left',
				WebkitTransitionProperty: 'left',
				...tempStyle
		  }
		: {
				transform: transformValue,
				'-webkit-transform': transformValue,
				...tempStyle
		  };

	return Object.assign(styleObj, custom ? custom : {});
}

export function transformString(
	value: string,
	duration = 300,
	delay = 0,
	isVertical = false,
	custom: object = undefined
) {
	const transformObj = transform(value, duration, delay, isVertical, custom);

	let transformString = '';

	for (let key in transformObj) {
		if (transformObj.hasOwnProperty(key)) {
			transformString += `${key}:${transformObj[key]}; `;
		}
	}

	return transformString;
}
