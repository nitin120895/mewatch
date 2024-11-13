import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';
import * as cx from 'classnames';

interface ClearIconProps extends React.Props<any> {
	className?: string;
}

export default class ClearIcon extends React.Component<ClearIconProps, any> {
	static SVG_DATA =
		'M10,0 C4.47,0 0,4.47 0,10 C0,15.53 4.47,20 10,20 C15.53,20 20,15.53 20,10 C20,4.47 15.53,0 10,0 Z M15,13.59 L13.59,15 L10,11.41 L6.41,15 L5,13.59 L8.59,10 L5,6.41 L6.41,5 L10,8.59 L13.59,5 L15,6.41 L11.41,10 L15,13.59 Z';
	static VIEW_BOX = { width: 20, height: 20 };

	render() {
		const classes = cx(this.props.className, 'svg-icon');
		return <SVGPathIcon className={classes} data={ClearIcon.SVG_DATA} viewBox={ClearIcon.VIEW_BOX} />;
	}
}
