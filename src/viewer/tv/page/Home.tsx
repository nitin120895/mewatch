import * as React from 'react';

const Home = (props: PageProps) => (
	<div className="component">
		<p>
			This{' '}
			<strong>
				<em>Component Browser</em>
			</strong>{' '}
			aids in:
		</p>
		<ul>
			<li>
				Discoverability of available components &amp; their configuration options for all team members and clients.
			</li>
			<li>The QA testing process by allowing testing in isolation.</li>
			<li>The client approval process when signing off new designs or functionality.</li>
		</ul>
	</div>
);

export default Home;
