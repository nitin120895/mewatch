import * as React from 'react';
import { AccountPageProps } from './configAccountPage';
import AccountPageTitle from '../../../pageEntry/account/common/AccountPageTitle';

interface StaticAccountPageProps extends AccountPageProps {
	singleSection: boolean;
	className?: string;
}

/**
 * Static account pages all have the same look and feel with a blue title header
 * section with a white content area underneath.
 *
 * When `props.singleSection` is true the wrapped component is encompassed with a
 * an element using the `page-entry` className to ensure it's rendered within the
 * white content area.
 *
 * Some pages may want multiple white sections so when `singleSection` is false
 * they're expected to wrap their own sections with the `page-entry` className
 * within their own JSX.
 */
export default function StaticAccountPage(props: StaticAccountPageProps) {
	const { className, singleSection, title, children } = props;
	return (
		<div className={className}>
			<section className="page-entry page-entry--hero">
				<AccountPageTitle title={title} />
			</section>
			{singleSection ? (
				<section className="page-entry">{children}</section>
			) : (
				<div className="static-entries">{children}</div>
			)}
		</div>
	);
}
