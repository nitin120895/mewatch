import * as React from 'react';

const viewBox = '-10 -10 220 220';
const data =
	'M200,100 C200,44.771525 155.228475,0 100,0 C44.771525,0 0,44.771525 0,100 C0,155.228475 44.771525,200 100,200 C155.228475,200 200,155.228475 200,100 Z';

export default props => {
	return (
		<svg {...props} viewBox={viewBox}>
			<path fill={'currentColor'} stroke={'currentStroke'} d={data} />
		</svg>
	);
};
