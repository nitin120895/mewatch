import { get } from 'shared/util/objects';
import { ErrorCta } from '../../player/Player';
import ModalTypes from 'shared/uiLayer/modalTypes';
import { noop } from 'shared/util/function';

const NO_MATCHING_SUBSCRIPTIONS_MODAL_ID = 'no-matching-subscriptions';

export function filterSubscriptionEntries(
	entries: api.PageEntry[],
	pricePlanIds: string[],
	onError = () => {}
): api.PageEntry[] {
	let filteredEntries = [];

	if (entries && pricePlanIds)
		entries.forEach(entry => {
			const pricePlans = get(entry, 'plan.pricePlans');
			if (pricePlans) {
				let entryAdded = false;
				pricePlans.forEach(plan => {
					if (entryAdded) return;
					if (pricePlanIds.includes(plan.id) && !entryAdded) {
						filteredEntries.push(entry);
						entryAdded = true;
					}
				});
			}
		});

	if (pricePlanIds && !filteredEntries.length) {
		onError();
	}

	return filteredEntries;
}

export function openErrorModal() {
	const props: ModalConfig = {
		id: NO_MATCHING_SUBSCRIPTIONS_MODAL_ID,
		type: ModalTypes.SYSTEM_ERROR,
		onClose: noop,
		componentProps: {
			title: '@{account_common_error}',
			description: '@{subscriptions_none_matching_error}',
			className: NO_MATCHING_SUBSCRIPTIONS_MODAL_ID,
			cta: ErrorCta.DISMISS
		}
	};
	return props;
}
