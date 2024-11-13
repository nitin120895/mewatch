import * as React from 'react';
import SVGPathIcon from 'shared/component/SVGPathIcon';

const SVG_DATA =
	'm0,18.1l19.1,0l5.9,-18.1l5.9,18.1l19.1,0l-15.4,11.2l5.9,18.1l-15.4,-11.2l-15.4,11.2l5.9,-18.1l-15.4,-11.2l0,0z';
const VIEW_BOX = { width: 48, height: 48 };

export default ({ className }: React.HTMLProps<any>) => (
	<SVGPathIcon className={className} data={SVG_DATA} viewBox={VIEW_BOX} />
);
