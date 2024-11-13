import { Image } from 'shared/analytics/types/v3/context/entry';

export interface Focusable {
	index: number;
	focusable: boolean;
	title?: string;
	dynamicHeight?: boolean;
	height: number;
	maxHeight?: number;
	innerTop?: number;
	ref?: HTMLElement;
	template?: string;
	forceScrollTop?: boolean;
	savedState?: object;
	refRowType?: string;
	internalNavi?: boolean;
	transY?: number;
	entryProps?: object;
	entryImageDetails?: Image;
	restoreSavedState: (savedState: object) => void;
	setFocus: (
		isFocused?: boolean,
		sourceLeftToViewport?: number,
		directional?: 'up' | 'down',
		isAutoFocus?: boolean
	) => boolean;
	moveLeft: () => boolean;
	moveRight: () => boolean;
	moveUp: (leftToViewport?: number) => boolean;
	moveDown: (leftToViewport?: number) => boolean;
	exec: (act?: string) => boolean;
	getLeftToViewport?: () => any;
	setFocusState?: (focusState: any) => boolean;
}

export class UnfocusableRow implements Focusable {
	constructor(index) {
		this.index = index;
		this.focusable = false;
		this.restoreSavedState = s => {};
		this.setFocus = s => {
			return false;
		};
		this.moveLeft = () => {
			return false;
		};
		this.moveRight = () => {
			return false;
		};
		this.moveUp = () => {
			return false;
		};
		this.moveDown = () => {
			return false;
		};
		this.exec = s => {
			return false;
		};
		this.getLeftToViewport = () => {
			return 0;
		};
	}

	focusable: boolean;
	index: number;
	height: number;
	ref?: HTMLElement;
	template?: string;
	entryProps?: object;
	entryImageDetails?: Image;
	restoreSavedState: (savedState: object) => void;
	setFocus: (isFocused?: boolean) => boolean;
	moveLeft: () => boolean;
	moveRight: () => boolean;
	moveUp: () => boolean;
	moveDown: () => boolean;
	exec: (act?: string) => boolean;
	getLeftToViewport: () => number;
}
