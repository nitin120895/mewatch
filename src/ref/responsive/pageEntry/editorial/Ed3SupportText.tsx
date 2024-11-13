import * as React from 'react';
import { resolveAlignment } from '../util/custom';
import EntryTitle from 'ref/responsive/component/EntryTitle';

interface CustomFields {
	textColor?: customFields.Color;
	textHorizontalAlignment?: position.AlignX;
}

type Ed3PageEntryProps = TPageEntryTextProps<CustomFields>;

export default function Ed3SupportText(props: Ed3PageEntryProps) {
	const { text, customFields } = props;
	return (
		<div className={`ed3 txt-${resolveAlignment(customFields.textHorizontalAlignment)}`}>
			<EntryTitle {...props} />
			<div dangerouslySetInnerHTML={{ __html: text }} />
		</div>
	);
}
