import * as React from 'react';
import Link from 'shared/component/Link';

const PageNotFound = (props: PageProps) => (
	<div>
		<h3>Page Not Found</h3>
		<Link to="@home">Home</Link>
	</div>
);

export default PageNotFound;
