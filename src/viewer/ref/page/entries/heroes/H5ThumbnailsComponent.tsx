import * as React from 'react';
import H5Thumbnails from 'ref/responsive/pageEntry/hero/h5/H5Thumbnails';
import CarouselComponent from './CarouselComponent';

export default function() {
	return <CarouselComponent positionToggles={false} children={React.createElement(H5Thumbnails)} />;
}
