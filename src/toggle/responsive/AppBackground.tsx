import * as React from 'react';
import * as cx from 'classnames';
import Picture from 'shared/component/Picture';
import { connect } from 'react-redux';
import { Bem } from 'shared/util/styles';

import { VideoEntryPoint } from 'shared/analytics/types/types';
import CTAWrapper from 'shared/analytics/components/CTAWrapper';

import './AppBackground.scss';

interface AppBackgroundProps {
	backgroundImage?: state.AppBgImageData;
	primaryData?: state.AppPrimaryData;
}

const bem = new Bem('app-background');

function AppBackground(props) {
	const { backgroundImage, primaryData } = props;

	if (!backgroundImage || !backgroundImage.sources || !backgroundImage.sources.length)
		// tslint:disable-next-line
		return null;

	const noHeroImage = backgroundImage.sources[0].isDefaultPlaceholder;

	const renderPicture = () => {
		return (
			<Picture
				src={backgroundImage.sources[0].src}
				sources={backgroundImage.sources}
				className={cx(bem.b(backgroundImage.appWallpaperCssModifier || ''), { 'no-hero-image': noHeroImage })}
				imageClassName={bem.e('image')}
			/>
		);
	};

	const renderPrimaryDataImage = () => {
		const { label, type, data, onClick } = primaryData;
		return (
			<CTAWrapper type={type} data={{ ...data, title: label, entryPoint: VideoEntryPoint.IDPHeroAutoPlay }}>
				<div onClick={onClick} className={bem.e('picture-wrapper')}>
					<Picture
						src={backgroundImage.sources[0].src}
						sources={backgroundImage.sources}
						className={cx(bem.b(backgroundImage.appWallpaperCssModifier || ''), { 'no-hero-image': noHeroImage })}
						imageClassName={bem.e('image')}
					/>
				</div>
			</CTAWrapper>
		);
	};

	return primaryData ? renderPrimaryDataImage() : renderPicture();
}

function mapStateToProps(state: state.Root) {
	return {
		backgroundImage: state.app.backgroundImage,
		primaryData: state.app.primaryData
	};
}

export default connect<any, any, AppBackgroundProps>(mapStateToProps)(AppBackground);
