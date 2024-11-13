import * as React from 'react';
import * as cx from 'classnames';
import Packshot from 'ref/responsive/component/Packshot';
import { getColumnClasses, calculateMedianWidth } from 'ref/responsive/util/grid';

const columns = [{ phone: 24 }, { laptop: 20 }, { desktop: 16 }, { uhd: 14 }];

export default class Pr1Banner extends React.Component<PageEntryItemProps, any> {
	// Width used when state.medianColumnWidth is unavailable
	static fallbackWidth = 720;
	constructor(props) {
		super(props);
		this.state = {
			medianColumnWidth: calculateMedianWidth(columns)
		};
	}

	render() {
		const imageOptions: image.Options = {
			width: this.state.medianColumnWidth || Pr1Banner.fallbackWidth
		};
		const packshotClasses = cx(...getColumnClasses(columns, 0, true), 'clearfix');
		return (
			<div className="row">
				<Packshot
					item={this.props.item}
					imageType={'hero7x1'}
					imageOptions={imageOptions}
					className={packshotClasses}
					titlePosition="none"
				/>
			</div>
		);
	}
}
