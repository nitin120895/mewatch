export function toMedian(values: number[]): number {
	values = values.slice().sort((a, b) => a - b);
	return (values[(values.length - 1) >> 1] + values[values.length >> 1]) / 2;
}

export function clamp(min: number, max: number, value: number) {
	return value < min ? min : value > max ? max : value;
}

export function rectContainsPoint({ top, left, bottom, right }, { x, y }) {
	return x >= left && x <= right && y >= top && y <= bottom;
}
