import * as React from 'react';
import TextInput, { TextInputProps, TextInputState } from 'toggle/responsive/component/input/TextInput';
import { isSafariAndCommandKeyPressed } from 'shared/util/browser';

const forbiddenPhoneNumberCharsRegExp = /[^0-9]/; // MEDTOG-11144: allow digits only

function hasForbiddenPhoneChar(value: string): boolean {
	return !!value.match(forbiddenPhoneNumberCharsRegExp);
}

const withPhoneValidation = Component => {
	return class extends React.Component<TextInputProps, TextInputState> {
		private onPaste = event => {
			// prevent to paste invalid phone number instead of sanitizing input and mutate event object
			const value = event.clipboardData.getData('text/plain');
			if (hasForbiddenPhoneChar(value)) {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		private onKeyPress = event => {
			// Using onKeyPress to validate user input before it will display on the screen
			if (hasForbiddenPhoneChar(event.key) && !isSafariAndCommandKeyPressed(event)) {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		render() {
			return <Component {...this.props} type="tel" onKeyPress={this.onKeyPress} onPaste={this.onPaste} />;
		}
	};
};

export const PhoneInput = withPhoneValidation(TextInput);
