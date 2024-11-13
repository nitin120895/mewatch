import * as React from 'react';
import { default as PageBase } from '../Page';
import routes from './routes';

// Import the app styles to maintain consistency between the viewer and the app
import 'ref/tv/App.scss';

// Ensure shared component styles are available
import 'ref/tv/shared-components.scss';

// Since the viewer provides a generic colour scheme we match the app's theming
import './app.scss';

export default function Page(props: any) {
	return (
		<main>
			<PageBase {...props} routes={routes} className={'grid-margin'} />
		</main>
	);
}
