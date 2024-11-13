import * as React from 'react';
import { Bem } from 'shared/util/styles';
import { XCS4 as template } from 'shared/page/pageEntryTemplate';
import PackshotList from 'ref/responsive/component/PackshotList';

import './XCS4.scss';

interface XCS4Props extends PageEntryListProps {
	columns: grid.BreakpointColumn[];
	imageType: image.Type;
}

const columns = [{ phone: 12 }, { phablet: 8 }, { tablet: 6 }, { laptop: 4 }, { desktopWide: 3 }];

const bem = new Bem('xcs4');

export default function XCS4(props: XCS4Props) {
	const { list, title } = props;

	if (!list) return;

	return (
		<div className={bem.b()}>
			<h4 className={bem.e('entry-title')}>{title}</h4>
			<PackshotList list={list} wrap={true} imageType="square" columns={columns} />
		</div>
	);
}

XCS4.template = template;
