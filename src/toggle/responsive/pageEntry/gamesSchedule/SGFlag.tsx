import * as React from 'react';

interface SGFlagProps {
	className?: string;
}

export default ({ className }: SGFlagProps) => {
	const sgFlag = require('../../../../../resource/toggle/image/games-schedule/sg-flag.svg');
	return <img className={className} src={sgFlag} />;
};
