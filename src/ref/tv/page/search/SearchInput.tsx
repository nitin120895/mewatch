import * as React from 'react';
import DeviceModel from 'shared/util/platforms/deviceModel';
import InputWithVK from './InputWithVK';
import InputWithOSK from './InputWithOSK';

export interface SearchInputProps extends React.Props<any> {
	onValueChange?: (value: string) => void;
	onInputBlur?: () => void;
	className?: string;
	autoFocus?: boolean;
	value: string;
	loading?: boolean;
	hasResults?: boolean;
}

const useOSK = DeviceModel.hasOSK();

/**
 * Search input component.
 */
export default class SearchInput extends React.PureComponent<SearchInputProps, any> {
	constructor(props) {
		super(props);
	}

	render() {
		if (useOSK) return <InputWithOSK {...this.props} />;
		return <InputWithVK {...this.props} />;
	}
}
