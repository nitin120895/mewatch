import * as React from 'react';
import EpgItemImage from '../components/EpgItemImage';
import EpgList from '../components/EpgList';
import { XEPG5 as template } from 'shared/page/pageEntryTemplate';

const columns = [{ phone: 12 }, { phablet: 8 }, { laptop: 6 }, { desktopWide: 4 }];

export default function XEPG5(props: PageEntryListProps) {
	return <EpgList {...props} itemComponent={EpgItemImage} columns={columns} />;
}

XEPG5.template = template;
