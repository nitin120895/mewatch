import * as React from 'react';

export default props => {
	return (
		<svg width="55" height="37" {...props} viewBox="0 0 55 37">
			<rect width="55" height="37" fill="#EFEFEF" rx="3" />
			<path fill="#4287CC" d="M0 9V3a3 3 0 0 1 3-3h49a3 3 0 0 1 3 3v6" />
			<path fill="#FFB450" d="M0 28v6a3 3 0 0 0 3 3h49a3 3 0 0 0 3-3v-6" />
		</svg>
	);
};
