export const updateStringWithKey = (value, key) => {
	let currentText = value;

	if (key.toUpperCase() === 'CLEAR') {
		currentText = '';
	} else if (key.toUpperCase() === 'DEL') {
		currentText = currentText.slice(0, -1);
	} else if (key.toUpperCase() === 'SPACE') {
		currentText += ' ';
	} else {
		currentText += key;
	}

	return currentText;
};
