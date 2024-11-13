import * as React from 'react';
import Picture from 'shared/component/Picture';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';

import './AppBackground.scss';

interface AppBackgroundProps {
	backgroundImage?: state.AppBgImageData;
}

const bem = new Bem('app-background');

function AppBackground(props) {
	const { backgroundImage } = props;

	if (!backgroundImage || !backgroundImage.sources || !backgroundImage.sources.length)
		// tslint:disable-next-line
		return null;

	return (
		<Picture
			src={backgroundImage.sources[0].src}
			sources={backgroundImage.sources}
			className={bem.b(backgroundImage.appWallpaperCssModifier || '')}
			imageClassName={bem.e('image')}
		/>
	);
}

function mapStateToProps(state: state.Root) {
	return {
		backgroundImage: state.app.backgroundImage
	};
}

export default connect<any, any, AppBackgroundProps>(mapStateToProps)(AppBackground);
