export type Offset = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export function calcOffset(ele: any): Offset {
	let offset = { left: 0, top: 0, width: 0, height: 0 };
	if (!ele) return offset;

	if (ele.offsetParent) {
		const os = calcOffset(ele.offsetParent);
		offset.left += os.left;
		offset.top += os.top;
		offset.width += os.width;
		offset.height += os.height;
	}

	offset.left += ele.offsetLeft;
	offset.top += ele.offsetTop;
	offset.width = ele.offsetWidth;
	offset.height = ele.offsetHeight;

	return offset;
}

export function checkIfVisible(element: HTMLElement, winOffsetY, winHeight) {
	const offset = calcOffset(element);

	if (offset.top + offset.height <= winOffsetY) {
		return false;
	}

	if (offset.top >= winOffsetY + winHeight) {
		return false;
	}

	return true;
}

export function checkHorizontalArrowDisplay(listTrans: number, clientWidth: number, scrollWidth: number) {
	let arrowDisplay = { showPrevArrow: true, showNextArrow: true };

	if (listTrans === 0) {
		arrowDisplay.showPrevArrow = false;
	}

	if (listTrans === clientWidth - scrollWidth || scrollWidth <= clientWidth) {
		arrowDisplay.showNextArrow = false;
	}

	return arrowDisplay;
}
