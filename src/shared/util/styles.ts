type BemModifier = string | string[] | { [key: string]: boolean };

/**
 * A utility class for generating BEM classnames. See http://getbem.com/naming/.
 *
 * Use by storing an instance of this class as a constant above your component class e.g.
 *
 *	const bem = new BemScope('my-component');
 *
 * Some examples:
 *
 *	const bem = new BemScope('b');
 *	bem.b();													// "b"
 *	bem.b('m');													// "b b--m"
 *	bem.b(['m1', 'm2', 'm3']);									// "b b--m1 b--m2 b--m3"
 *	bem.b({ m1: false, m2: true, m3: false });					// "b b--m2"
 *	bem.b('m1', ['m2', 'm3'], { m4: true, m5: false });			// "b b--m1 b--m2 b--m3 b--m4"
 *
 *	bem.e('e');													// "b__e"
 *	bem.e('e', 'm');											// "b__e b__e--m"
 *	bem.e('e', ['m1', 'm2', 'm3']);								// "b__e b__e--m1 b__e--m2 b__e--m3"
 *	bem.e('e', { m1: false, m2: true, m3: false });				// "b__e b__e--m2"
 *	bem.e('e', 'm1', ['m2', 'm3'], { m4: true, m5: false });	// "b__e b__e--m1 b__e--m2 b__e--m3 b__e--m4"
 */
export class Bem {
	private blockName: string;

	constructor(blockName = '') {
		this.blockName = blockName;
	}

	private getModifierNames(modifier: BemModifier): string[] {
		if (Array.isArray(modifier)) {
			return modifier.filter(m => !!m);
		} else if (typeof modifier === 'object') {
			return Object.keys(modifier).filter(m => !!modifier[m]);
		} else if (modifier) {
			return [modifier];
		}
		return [];
	}

	private appendModifiers(name: string, modifiers?: BemModifier[]): string {
		if (modifiers && modifiers.length) {
			let modifierNames: string[] = [];
			for (let modifier of modifiers) {
				modifierNames = modifierNames.concat(this.getModifierNames(modifier));
			}
			if (modifierNames.length) {
				return name + ' ' + modifierNames.map(m => `${name}--${m}`).join(' ');
			}
		}
		return name;
	}

	/**
	 * Generates a class name for the root block of a component.
	 *
	 * @param {BemModifier[]} modifiers The modifier(s) to apply to the block name.
	 * @returns	{string} A BEM compliant class name string.
	 */
	b(...modifiers: BemModifier[]): string {
		return this.appendModifiers(this.blockName, modifiers);
	}

	/**
	 * Generates a class name for a sub element within a component.
	 *
	 * @param {string} element The name of the element.
	 * @param {BemModifier[]} modifiers The modifier(s) to apply to the element name.
	 * @returns	{string} A BEM compliant class name string.
	 */
	e(element: string, ...modifiers: BemModifier[]): string {
		return this.appendModifiers(`${this.blockName}__${element}`, modifiers);
	}
}

// Adds a class to an element if it doesn't already have it.
// Note that this bypasses React and should be used sparingly!
export function addElementClass(element, className): boolean {
	const classes = element.classList;
	if (!classes.contains(className)) {
		classes.add(className);
		return true;
	}
	return false;
}

// Removes a class from an element if it already has it applied.
// Note that this bypasses React and should be used sparingly!
export function removeElementClass(element, className): boolean {
	const classes = element.classList;
	if (classes.contains(className)) {
		classes.remove(className);
		return true;
	}
	return false;
}

// Toggles a class on/off for the provided element.
// Note that this bypasses React and should be used sparingly!
export function toggleElementClass(element, className): void {
	const classes = element.classList;
	classes.contains(className) ? classes.remove(className) : classes.add(className);
}

// Conversion of a 3 character short-form hex to a 6 character long-form hex.
function parseHex(m, r, g, b) {
	return '#' + r + r + g + g + b + b;
}

// Converts a hexadecimal string into an RGB or RGBA CSS value suitable for a color assignment.
// Returns undefined when provided with an invalid hex value.
export function hexToRgba(hex: string, alpha = 1.0) {
	if (hex.charAt(0) !== '#') hex = `#${hex}`;
	if (hex.length > 7) hex = hex.substr(0, 7);
	if (!(hex.length === 4 || hex.length === 7)) {
		return undefined;
	}

	if (alpha < 0) alpha = 0;
	else if (alpha > 1) alpha = 1;
	const regex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	const rgb = hex
		.replace(regex, parseHex)
		.substring(1)
		.match(/.{2}/g)
		.map(x => {
			const i = parseInt(x, 16);
			return isNaN(i) ? undefined : i;
		});

	if (~rgb.indexOf(undefined)) return undefined;
	return alpha < 1 ? `rgba(${rgb.join(',')},${alpha})` : `rgb(${rgb.join(',')})`;
}

export function isPartiallyVisible(element: Element, relatedElement: Element, part: number): boolean {
	if (element && relatedElement) {
		const rect = element.getBoundingClientRect();
		const pageRect = relatedElement.getBoundingClientRect();

		const rectLeftPosition = rect.left + rect.width * part;
		const pageLeftPosition = pageRect.left + pageRect.width;
		return rectLeftPosition < pageLeftPosition;
	}

	return false;
}
