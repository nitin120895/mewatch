import * as React from 'react';
import { AccountPageProps } from 'ref/responsive/page/account/common/configAccountPage';
import AccountPageTitle from '../../../pageEntry/account/common/AccountPageTitle';
import { AccountProfileEdit as profileEditKey, AccountProfileResetPin } from 'shared/page/pageKey';
import AhTitle from 'ref/responsive/pageEntry/account/ah/AhTitle';
import * as cx from 'classnames';

import './StaticAccountPage.scss';

interface StaticAccountPageProps extends AccountPageProps {
	singleSection: boolean;
	className?: string;
	activeProfile?: api.ProfileDetail;
	profile?: api.ProfileDetail;
	pageKey?: string;
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
	const { className, singleSection, children, activeProfile, account, profile, pageKey } = props;
	const isPrimaryAccountActive = account ? activeProfile.id === account.primaryProfileId : true;
	const isBackNavigationDisabled = pageKey === profileEditKey && !isPrimaryAccountActive;
	const noBackNavigation = pageKey === AccountProfileResetPin;

	return (
		<div className={cx(className, 'static-pg-account')}>
			<section className="page-entry page-entry--hero">
				{isBackNavigationDisabled ? (
					<div className="ah-row">{profile && <AhTitle title={profile.name} />}</div>
				) : (
					<AccountPageTitle noBackNavigation={noBackNavigation} {...props} />
				)}
			</section>
			{singleSection ? (
				<section className="page-entry">{children}</section>
			) : (
				<div className="static-entries">{children}</div>
			)}
		</div>
	);
}
