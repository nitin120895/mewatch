const currencies = [
	new Set(['CAD', 'AUD', 'NZD', 'USD', 'HKD', 'SGD']),
	new Set(['GBP', 'EGP', 'GIP', 'GGP', 'JEP', 'LBP', 'SHP', 'SYP']),
	new Set(['JPY', 'CNY']),
	new Set(['AWG', 'ANG']),
	new Set(['BNG', 'KZT', 'KGS', 'UZS']),
	new Set(['CUP', 'PHP']),
	new Set(['IRR', 'OMR', 'QAR', 'SAR', 'YER']),
	new Set(['MUR', 'NPR', 'PKR', 'SCR', 'LKR']),
	new Set(['KPW', 'KRW'])
];

export default function codeToSymbol(code: string): string {
	if (currencies[0].has(code)) {
		return '$';
	} else if (currencies[1].has(code)) {
		return '£';
	} else if ('EUR' === code) {
		return '€';
	} else if (currencies[2].has(code)) {
		return '¥';
	} else if (currencies[3].has(code)) {
		return 'ƒ';
	} else if (currencies[4].has(code)) {
		return 'лв';
	} else if (currencies[5].has(code)) {
		return '₱';
	} else if (currencies[6].has(code)) {
		return '﷼';
	} else if (currencies[7].has(code)) {
		return '₨';
	} else if (currencies[8].has(code)) {
		return '₩';
	} else if ('' === code) {
		return '';
	} else {
		return '$';
	}
}
