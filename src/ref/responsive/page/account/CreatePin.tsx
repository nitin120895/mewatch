import * as React from 'react';
import { configPage } from 'shared/';
import { STATIC as template } from 'shared/page/pageTemplate';
import { CreatePin as key } from 'shared/page/pageKey';

const CreatePin = (props: PageProps) => (
	<div>
		<h3>CREATE PIN PAGE</h3>
	</div>
);

export default configPage(CreatePin, { theme: 'account', template, key });
