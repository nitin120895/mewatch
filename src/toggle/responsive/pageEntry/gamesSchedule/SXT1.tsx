import * as React from 'react';
import { SXT1 as template } from 'shared/page/pageEntryTemplate';
import GamesSchedule from './GamesSchedule';

export default function SXT1(props) {
	return <GamesSchedule {...props} />;
}

SXT1.template = template;
