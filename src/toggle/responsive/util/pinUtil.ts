import { setItem, getItem, removeItem } from 'shared/util/localStorage';

const URL_BEFORE_RESET_PIN = 'pageurlbeforerestpin';

export const setPageUrlBeforePinReset = (path = '/') => {
	setItem(URL_BEFORE_RESET_PIN, path);
};

export const getPageUrlBeforePinReset = (): string => {
	return getItem(URL_BEFORE_RESET_PIN);
};

export const removePageUrlBeforePinReset = () => {
	removeItem(URL_BEFORE_RESET_PIN);
};

export enum InputTypes {
	TEL = 'tel',
	PASSWORD = 'password',
	TEXT = 'text'
}
