import * as React from 'react';

/**
 * Replicates the markup structure of an account page (centred column, gray background, etc.)
 */
export default function AccountPageStructure({ children }) {
	return (
		<div className="app app--account">
			<div className="content grid-margin">
				<div className="main">
					<div className="page">
						<div className="pg-account">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
