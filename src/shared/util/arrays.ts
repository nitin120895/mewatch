export function uniqBy(array: Array<object>, prop: any) {
	return array.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
	});
}
