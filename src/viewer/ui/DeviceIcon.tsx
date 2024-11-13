import * as React from 'react';
import SVGPathIcon from './SVGPathIcon';

interface DeviceIconProps extends React.HTMLProps<any> {
	type: viewport.DeviceType;
	width?: number | string;
	height?: number | string;
}

export default class DeviceIcon extends React.Component<DeviceIconProps, any> {
	static defaultProps = {
		width: '100%',
		height: '100%'
	};
	constructor(props) {
		super(props);
	}
	getIconData = type => {
		let data;
		switch (type) {
			case 'phone':
				data =
					'M46 0H18c-3.3 0-6 2.7-6 6v52c0 3.3 2.7 6 6 6h28c3.3 0 6-2.7 6-6V6C52 2.7 49.3 0 46 0zM24 3h16v2H24V3zM32 60c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4S34.2 60 32 60zM48 48H16V8h32V48z';
				break;
			case 'phablet':
				data =
					'M49.5 0h-36c-2.2 0-4 1.8-4 4v56c0 2.2 1.8 4 4 4h36c2.2 0 4-1.8 4-4V4C53.5 1.8 51.7 0 49.5 0zM31.5 61.1c-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1c1.7 0 3.1 1.4 3.1 3.1S33.2 61.1 31.5 61.1zM49.5 52h-36V8h36V52z';
				break;
			case 'tablet':
				data =
					'M7.4 3.1c0-0.9 0.3-1.7 0.8-2.3C8.8 0.3 9.5 0 10.5 0h43.1c0.9 0 1.7 0.3 2.2 0.9s0.8 1.3 0.8 2.3v57.8c0 0.9-0.3 1.7-0.8 2.2S54.5 64 53.5 64H10.5c-0.9 0-1.7-0.3-2.2-0.8 -0.6-0.6-0.8-1.3-0.8-2.2V3.1zM12.8 57.6h38.4V6.5H12.8V57.6zM30.5 61.4c0 0.4 0.1 0.8 0.4 1.1s0.7 0.4 1.1 0.4c0.4 0 0.8-0.1 1.1-0.4s0.4-0.7 0.4-1.1c0-0.5-0.2-0.9-0.5-1.2s-0.7-0.4-1-0.4c-0.4 0-0.7 0.1-1 0.4S30.5 60.9 30.5 61.4z';
				break;
			case 'laptop':
				data =
					'M5.8,55.2V22.9c0-0.7,0.3-1.4,0.9-2C7.4,20.3,8,20,8.7,20h46.5c0.7,0,1.4,0.3,2,0.9c0.6,0.6,0.9,1.3,0.9,2v32.3L64,61	c0,0.8-0.3,1.5-0.8,2.1S62,64,61.1,64H2.9c-0.8,0-1.5-0.3-2.1-0.8S0,61.9,0,61L5.8,55.2z M8.7,55.2h46.5V22.9H8.7V55.2z M23.8,60.8 c0,0.2,0.3,0.3,0.9,0.3h14.5c0.6,0,0.9-0.1,0.9-0.3c0,0,0-0.1-0.1-0.1l-1.8-1.9c-0.2-0.2-0.5-0.2-1.1-0.2H26.8c-0.6,0-0.9,0.1-1,0.2	L23.8,60.8L23.8,60.8z';
				break;
			case 'desktop':
				data =
					'M0,19.2v30.9h49.5V19.2H0z M46.4,47H3.1V22.3h43.3V47z M32.5,53.2H17l-1.5,6.2l-3.1,3.1h24.7L34,59.4L32.5,53.2z';
				break;
			case 'desktopWide':
				data = 'M0,8v40h64V8H0z M60,44H4V12h56V44z M42,52H22l-2,8l-4,4h32l-4-4L42,52z';
				break;
			case 'uhd':
				data =
					'M2.34,15.32a230.73,230.73,0,0,0,29.77,1.91,235.71,235.71,0,0,0,29.77-1.91A1.8,1.8,0,0,1,64,17v40.4a1.91,1.91,0,0,1-1.91,1.91h-.43a197.42,197.42,0,0,0-29.55-2.13,203.09,203.09,0,0,0-30,2.13A2.07,2.07,0,0,1,0,57.63V17.23a1.91,1.91,0,0,1,1.91-1.91ZM20,62.74a1.7,1.7,0,0,1-1.28-2.34,2,2,0,0,1,2.55-1.28c1.7.64,6.17.85,10.63.85a57.73,57.73,0,0,0,10.84-.85,2,2,0,0,1,2.55,1.28A1.7,1.7,0,0,1,44,62.74c-2.13.85-7.23,1.06-12.12,1.06S22.11,63.59,20,62.74ZM32.11,21.06A249.36,249.36,0,0,1,3.83,19.57V55.08a249.3,249.3,0,0,1,28.28-1.7,207.19,207.19,0,0,1,28.07,1.7V19.57C50.82,20.42,41.46,21.06,32.11,21.06Z';
				break;
			case 'uconstrained':
			default:
				data =
					'M49 47c-4 0-7.8-1.6-10.6-4.4L32 36.2l-6.4 6.4C22.8 45.4 19 47 15 47s-7.8-1.6-10.6-4.4C1.6 39.8 0 36 0 32s1.6-7.8 4.4-10.6C7.2 18.6 11 17 15 17s7.8 1.6 10.6 4.4l6.4 6.4 6.4-6.4C41.2 18.6 45 17 49 17s7.8 1.6 10.6 4.4S64 28 64 32s-1.6 7.8-4.4 10.6C56.8 45.4 53 47 49 47zM42.6 38.4c1.7 1.7 4 2.6 6.4 2.6s4.7-0.9 6.4-2.6 2.6-4 2.6-6.4 -0.9-4.7-2.6-6.4S51.4 23 49 23s-4.7 0.9-6.4 2.6L36.2 32 42.6 38.4zM15 23c-2.4 0-4.7 0.9-6.4 2.6S6 29.6 6 32s0.9 4.7 2.6 6.4 4 2.6 6.4 2.6 4.7-0.9 6.4-2.6l6.4-6.4 -6.4-6.4C19.7 23.9 17.4 23 15 23 15 23 15 23 15 23z';
				break;
		}
		return data;
	};
	render() {
		const { type, width, height, className } = this.props;
		const viewBox = { width: 64, height: 64 };
		const data = this.getIconData(type);
		return <SVGPathIcon className={className} data={data} viewBox={viewBox} width={width} height={height} />;
	}
}