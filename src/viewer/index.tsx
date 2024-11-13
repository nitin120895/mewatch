import * as React from 'react';
import { render } from 'react-dom';
import Viewer from './Viewer';

import './index.scss';

if (module.hot) module.hot.accept();

/**
 * Component Viewer Interface.
 *
 * The UI for presenting component pages.
 */
render(<Viewer />, document.getElementById('root'));
