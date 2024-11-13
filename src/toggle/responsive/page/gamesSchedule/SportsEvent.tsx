import * as React from 'react';
import { configPage } from 'shared/';
import { SportsEvent as template } from 'shared/page/pageTemplate';
import SXT1 from 'toggle/responsive/pageEntry/gamesSchedule/SXT1';

function SportsEvent({ renderEntries }: PageProps) {
	return <div className="pg-games-schedule full-bleed">{renderEntries()}</div>;
}
export default configPage(SportsEvent, {
	template,
	entryRenderers: [SXT1]
});
